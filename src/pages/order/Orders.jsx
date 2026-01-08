import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { ref, onValue, set, update } from "firebase/database";
import { db, auth } from "../../firebaseConfig";
import Layout from "../../component/Layout";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [modalOrder, setModalOrder] = useState(null);
  const [reason, setReason] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const [cancelRequests, setCancelRequests] = useState({});
  const [toast, setToast] = useState(null);
  const [trackModal, setTrackModal] = useState(null);

  // REVIEW STATES
  const [reviewOrder, setReviewOrder] = useState(null);
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewImages, setReviewImages] = useState([]); // selected File objects
  const [previewUrls, setPreviewUrls] = useState([]); // local previews
  const [reviews, setReviews] = useState({});
  const [uploadingImages, setUploadingImages] = useState(false);
  const [userReviews, setUserReviews] = useState({}); // Track user's reviews

  const API = import.meta.env.VITE_API_URL || "http://localhost:5001";

  // Using a free image hosting service (ImgBB) - no Firebase Storage needed
  const IMGBB_API_KEY = "2c0f25ad6a55b05b8d7cab38b3851860"; // Your ImgBB API key

  // keep ref to revoke object URLs on unmount/replace
  const previewsRef = useRef([]);

  // ----------------- LOAD ORDERS -----------------
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      if (!user) return setOrders([]);

      const orderRef = ref(db, `orders/${user.uid}`);
      const off = onValue(orderRef, (snap) => {
        if (!snap.exists()) return setOrders([]);
        const data = snap.val();
        const list = Object.keys(data).map((id) => ({ id, ...data[id] }));
        setOrders(list.reverse());
      });

      return () => off();
    });

    return () => unsub();
  }, []);

  // ----------------- LOAD CANCEL REQUESTS -----------------
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      if (!user) return setCancelRequests({});

      const reqRef = ref(db, `cancelRequests/${user.uid}`);
      const off = onValue(reqRef, (snap) => {
        setCancelRequests(snap.val() || {});
      });

      return () => off();
    });

    return () => unsub();
  }, []);

  // ----------------- LOAD REVIEWS FOR ALL ORDERS -----------------
  useEffect(() => {
    if (orders.length === 0) return;

    const user = auth.currentUser;
    if (!user) return;

    orders.forEach((order) => {
      const reviewRef = ref(db, `reviews/${order.id}`);

      onValue(reviewRef, (snap) => {
        const orderReviews = snap.val() || {};
        setReviews((prev) => ({
          ...prev,
          [order.id]: orderReviews,
        }));

        // Check if current user has reviewed this order
        if (orderReviews[user.uid]) {
          setUserReviews((prev) => ({
            ...prev,
            [order.id]: orderReviews[user.uid],
          }));
        }
      });
    });
  }, [orders]);

  // cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      previewsRef.current.forEach((u) => URL.revokeObjectURL(u));
      previewsRef.current = [];
    };
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  // ----------------- CANCEL ORDER MODAL -----------------
  const openCancelModal = (o) => {
    setModalOrder(o);
    setReason("");
    setOtherReason("");
  };

  const closeCancelModal = () => {
    setModalOrder(null);
    setReason("");
    setOtherReason("");
  };

  const submitCancelRequest = async () => {
    const user = auth.currentUser;
    if (!user) return alert("Login first.");

    if (!reason || (reason === "Other" && !otherReason.trim())) {
      return alert("Please select a reason.");
    }

    const finalReason = reason === "Other" ? otherReason.trim() : reason;

    try {
      await set(ref(db, `cancelRequests/${user.uid}/${modalOrder.id}`), {
        orderId: modalOrder.orderId || modalOrder.id,
        reason: finalReason,
        requestedAt: new Date().toISOString(),
        status: "Pending",
      });

      await update(ref(db, `orders/${user.uid}/${modalOrder.id}`), {
        cancelRequested: true,
        status: "Pending Cancel",
      });

      showToast("Cancel request sent to admin.");
      closeCancelModal();
    } catch {
      alert("Error submitting request.");
    }
  };

  // ----------------- TRACKING MODAL -----------------
  const openTrackModal = async (order) => {
    const awb =
      order.awbCode ||
      order.trackingNumber ||
      order.awb ||
      order.shipmentOrderId ||
      order.shipmentId ||
      null;

    const directUrl = order.trackingUrl || null;

    if (directUrl) {
      setTrackModal({
        order,
        awb,
        events: [],
        loading: false,
        error: null,
        trackingUrl: directUrl,
      });
      return;
    }

    if (!awb) return alert("Tracking number not available.");

    setTrackModal({
      order,
      awb,
      events: [],
      loading: true,
      error: null,
      trackingUrl: null,
    });

    try {
      const res = await axios.get(`${API}/track/${awb}`, { timeout: 20000 });

      let events = [];

      if (Array.isArray(res.data?.data?.data)) {
        events = res.data.data.data;
      } else if (Array.isArray(res.data?.data?.tracking_data)) {
        events = res.data.data.tracking_data;
      }

      const formatted = events.map((ev) => ({
        status: ev.status || ev.activity || "",
        date: ev.date || ev.time || ev.created_at || "",
        location: ev.location || ev.city || "",
      }));

      setTrackModal((t) => ({
        ...t,
        events: formatted,
        loading: false,
      }));
    } catch {
      setTrackModal((t) => ({
        ...t,
        loading: false,
        error: "Tracking unavailable",
      }));
    }
  };

  const closeTrackModal = () => setTrackModal(null);

  const niceDate = (d) => {
    if (!d) return "";
    const dt = new Date(d);
    return isNaN(dt) ? d : dt.toLocaleString();
  };

  // ----------------- Review image selection + preview -----------------
  const onReviewImagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    // revoke old previews
    previewsRef.current.forEach((u) => URL.revokeObjectURL(u));
    previewsRef.current = [];

    const urls = files.map((f) => {
      const u = URL.createObjectURL(f);
      previewsRef.current.push(u);
      return u;
    });

    setReviewImages(files);
    setPreviewUrls(urls);
  };

  // ----------------- OPTIMIZED UPLOAD IMAGES TO IMGBB -----------------
  const uploadImagesToImgBB = async (files) => {
    if (!files || files.length === 0) return [];
    
    setUploadingImages(true);
    const uploadedUrls = [];

    try {
      // Upload images in parallel for faster performance
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('key', IMGBB_API_KEY);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

        try {
          const response = await fetch('https://api.imgbb.com/1/upload', {
            method: 'POST',
            body: formData,
            signal: controller.signal
          });

          clearTimeout(timeoutId);
          
          if (!response.ok) {
            throw new Error(`Upload failed: ${response.status}`);
          }

          const result = await response.json();
          
          if (result.success) {
            return result.data.url;
          } else {
            console.error('ImgBB upload failed:', result);
            return null;
          }
        } catch (error) {
          clearTimeout(timeoutId);
          console.error('Upload error:', error);
          return null;
        }
      });

      // Wait for all uploads to complete
      const results = await Promise.all(uploadPromises);
      
      // Filter out failed uploads
      const successfulUploads = results.filter(url => url !== null);
      uploadedUrls.push(...successfulUploads);

      if (successfulUploads.length === 0) {
        throw new Error('All uploads failed');
      }

    } catch (error) {
      console.error('Image upload error:', error);
      alert('Failed to upload images. Please try again.');
    } finally {
      setUploadingImages(false);
    }

    return uploadedUrls;
  };

  // ----------------- SUBMIT REVIEW (OPTIMIZED) -----------------
  const submitReview = async () => {
    const user = auth.currentUser;
    if (!user) return alert("Login required.");

    if (!reviewOrder) return alert("No order selected.");

    try {
      // basic validation
      if (!reviewText.trim()) return alert("Please write a review.");
      if (!rating || rating < 1) return alert("Please select rating.");

      // Show immediate feedback
      setUploadingImages(true);

      // Upload images to ImgBB instead of Firebase Storage
      const imageUrls = await uploadImagesToImgBB(reviewImages);

      // Save review: images as array (backwards-compatible with single 'image')
      await set(ref(db, `reviews/${reviewOrder.id}/${user.uid}`), {
        orderId: reviewOrder.orderId || reviewOrder.id,
        rating: Number(rating),
        review: reviewText,
        images: imageUrls, // <-- array of ImgBB URLs
        createdAt: new Date().toISOString(),
      });

      showToast("Review added successfully.");
      
      // Update local state immediately
      setUserReviews((prev) => ({
        ...prev,
        [reviewOrder.id]: {
          orderId: reviewOrder.orderId || reviewOrder.id,
          rating: Number(rating),
          review: reviewText,
          images: imageUrls,
          createdAt: new Date().toISOString(),
        }
      }));

      // reset form
      setReviewOrder(null);
      setReviewText("");
      setRating(5);
      setHoverRating(0);
      setReviewImages([]);
      // revoke previews
      previewsRef.current.forEach((u) => URL.revokeObjectURL(u));
      previewsRef.current = [];
      setPreviewUrls([]);
    } catch (err) {
      console.error("submitReview error:", err);
      alert("Failed to submit review.");
    } finally {
      setUploadingImages(false);
    }
  };

  // ----------------- EDIT REVIEW -----------------
  const editReview = (order) => {
    const user = auth.currentUser;
    if (!user || !userReviews[order.id]) return;

    const existingReview = userReviews[order.id];
    setReviewOrder(order);
    setReviewText(existingReview.review);
    setRating(existingReview.rating);
    setReviewImages([]);
    setPreviewUrls([]);
  };

  // ----------------- UI: Star component -----------------
  const Star = ({ idx }) => {
    const active = hoverRating ? idx <= hoverRating : idx <= rating;
    return (
      <span
        className={`text-2xl cursor-pointer ${active ? "text-yellow-400" : "text-gray-300"}`}
        onClick={() => setRating(idx)}
        onMouseEnter={() => setHoverRating(idx)}
        onMouseLeave={() => setHoverRating(0)}
      >
        ★
      </span>
    );
  };

  // Check if user has reviewed a specific order
  const hasUserReviewed = (orderId) => {
    const user = auth.currentUser;
    return user && userReviews[orderId] && userReviews[orderId].userId === user.uid;
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-10">
        <h2 className="text-xl tracking-wide uppercase font-medium mb-10">My Orders</h2>

        {orders.length === 0 && <p className="text-gray-500">No orders found.</p>}

        <div className="space-y-4">
          {orders.map((order) => {
            const awb =
              order.awbCode ||
              order.trackingNumber ||
              order.awb ||
              order.shipmentOrderId ||
              order.shipmentId ||
              null;

            const pendingReq =
              cancelRequests?.[order.id]?.status === "Pending" || order.cancelRequested;

            const cancelled = order.status === "Cancelled";
            const delivered = order.status === "Delivered";
            const userHasReviewed = userReviews[order.id] !== undefined;

            return (
              <div key={order.id} className="bg-white border border-gray-200 p-4 md:p-6">
                {cancelled && (
                  <div className="text-center mb-3">
                    <img src="https://cdn-icons-png.flaticon.com/512/463/463612.png " className="h-16 opacity-75 mx-auto" />
                  </div>
                )}

                {/* PRODUCT IMAGES */}
                <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                  {order.items?.map((item, i) => (
                    <div key={i} className="w-16 h-20 md:w-20 md:h-24 border border-gray-200 overflow-hidden">
                      <img
                        src={item.image || item.imgUrl || item.thumbnail || "/placeholder.png"}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                    <div className="">
                  <div>
                   <div className="text-sm uppercase tracking-wide text-gray-500">
  Order
</div>
<div className="text-sm font-medium text-black">
  {order.orderId || order.id}
</div>

                    <div className="text-xs text-gray-400 mt-1">{niceDate(order.date)}</div>

                    <div className="mt-1">
                      Status:{" "}
                     <span className={`text-xs uppercase tracking-wide ${
  cancelled ? "text-red-600" :
  delivered ? "text-green-600" :
  "text-gray-700"
}`}>
  {order.status || "Placed"}
</span>

                    </div>

                    {awb && <div className="text-sm mt-1 text-blue-600">AWB: {awb}</div>}

                    {order.courierName && <div className="text-sm text-gray-600">Courier: {order.courierName}</div>}
                  </div>

                
                </div>
                  <div className="flex md:flex-col justify-between md:items-end  mt-4 md:mt-0flex flex-col items-end gap-2">
                    <div className="text-base font-medium">₹{order.total}</div>

                    {!pendingReq && !cancelled && !delivered && (
                      <button
                        className="text-xs uppercase tracking-wide border border-black px-4 py-2 hover:bg-black hover:text-white transition"
                        onClick={() => openCancelModal(order)}
                      >
                        Cancel Order
                      </button>
                    )}

                    {pendingReq && !cancelled && <span className="text-yellow-600 text-sm">Cancel Pending</span>}

                    {awb && (
                      <button className="text-xs uppercase tracking-wide border px-4 py-2 hover:bg-gray-100" onClick={() => openTrackModal(order)}>
                        Track your order
                      </button>
                    )}

                    {delivered && (
                      <>
                        {!userHasReviewed ? (
                          <button
                            className="text-xs uppercase tracking-wide border px-4 py-2 hover:bg-black hover:text-white transition"
                            onClick={() => {
                              setReviewOrder(order);
                              // reset review form for this order
                              setReviewText("");
                              setRating(5);
                              setHoverRating(0);
                              setReviewImages([]);
                              setPreviewUrls([]);
                              previewsRef.current.forEach((u) => URL.revokeObjectURL(u));
                              previewsRef.current = [];
                            }}
                          >
                            Add Review
                          </button>
                        ) : (
                          <button
                            className="px-3 py-1 border border-blue-600 text-blue-600 rounded hover:bg-blue-600 hover:text-white text-sm"
                            onClick={() => editReview(order)}
                          >
                            Edit Review
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* SHOW EXISTING REVIEWS (supports images[] or legacy image) */}
                {reviews[order.id] &&
                  Object.keys(reviews[order.id]).map((uid) => {
                    const r = reviews[order.id][uid];
                    const imagesToShow = r.images || (r.image ? [r.image] : []);
              
                 return (
                      <div key={uid} className="border-t border-gray-200 pt-4 mt-4">
                        <div className="text-sm font-medium mb-1">Rating: {r.rating} ⭐</div>
                        <p className="text-sm text-gray-700">{r.review}</p>

                        {imagesToShow.length > 0 && (
                          <div className="flex gap-2 mt-2 flex-wrap">
                            {imagesToShow.map((img, i) => (
                              <img key={i} src={img} className="w-16 h-20 object-cover border border-gray-200" />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                    })}
              </div>
            );
          })}
        </div>

        {/* ------------- CANCEL MODAL ------------- */}
        {modalOrder && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-5 rounded-lg max-w-md w-full">
              <h3 className="text-lg font-semibold mb-2">Cancel Order {modalOrder.orderId}</h3>

              <select className="w-full border p-2 rounded mb-3" value={reason} onChange={(e) => setReason(e.target.value)}>
                <option value="">Select a Reason</option>
                <option value="Ordered by mistake">Ordered by mistake</option>
                <option value="Found cheaper elsewhere">Found cheaper elsewhere</option>
                <option value="Delivery taking too long">Delivery taking too long</option>
                <option value="Other">Other</option>
              </select>

              {reason === "Other" && (
                <input className="w-full border p-2 rounded mb-3" placeholder="Type your reason" value={otherReason} onChange={(e) => setOtherReason(e.target.value)} />
              )}

              <div className="flex justify-end gap-2">
                <button className="border px-4 py-2 rounded" onClick={closeCancelModal}>
                  Close
                </button>
                <button className="bg-red-600 text-white px-4 py-2 rounded" onClick={submitCancelRequest}>
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ------------- TRACK MODAL ------------- */}
        {trackModal && (
          <div className="fixed inset-0 bg-black/40 flex items-start justify-center p-4 pt-16 z-50 overflow-auto">
            <div className="bg-white p-5 rounded-lg w-full max-w-xl">
              <div className="flex justify-between mb-2">
                <h3 className="bg-white p-6 max-w-md w-full">Tracking — {trackModal.awb}</h3>
                <button className="border px-5 py-2 text-xs uppercase tracking-wide" onClick={closeTrackModal}>
                  Close
                </button>
              </div>

              {trackModal.trackingUrl && (
                <a href={trackModal.trackingUrl} target="_blank" className="text-blue-600 underline text-sm">
                  Open Tracking Page
                </a>
              )}

              {trackModal.loading && <p className="text-gray-500">Loading...</p>}

              {trackModal.error && <p className="text-red-600">{trackModal.error}</p>}

              {!trackModal.loading && !trackModal.error && trackModal.events?.length === 0 && <p className="text-gray-500">No tracking data available</p>}

              <div className="space-y-3 mt-4">
                {trackModal.events?.map((ev, i) => (
                  <div key={i} className="border-l pl-3">
                    <div className="font-medium">{ev.status}</div>
                    <div className="text-sm text-gray-500">{ev.location}</div>
                    <div className="text-xs text-gray-400">{niceDate(ev.date)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {toast && <div className="fixed bottom-6 right-4 bg-black text-white px-4 py-2 rounded shadow-lg">{toast}</div>}

        {/* ---------- REVIEW MODAL ---------- */}
        {reviewOrder && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-5 rounded-lg max-w-md w-full">
              <h3 className="text-lg font-semibold mb-3">
                {userReviews[reviewOrder.id] ? 'Edit Review' : 'Add Review'} — {reviewOrder.orderId || reviewOrder.id}
              </h3>

              <label className="font-medium">Rating:</label>
              <div className="flex gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} idx={i} />
                ))}
              </div>

              <textarea className="w-full border rounded p-2 h-24 mb-3" placeholder="Write your review..." value={reviewText} onChange={(e) => setReviewText(e.target.value)} />

              <label className="font-medium">Upload Images (optional):</label>
              <input type="file" accept="image/*" multiple className="border p-2 w-full rounded mb-3" onChange={onReviewImagesChange} />

              {/* preview */}
              {previewUrls.length > 0 && (
                <div className="flex gap-2 mb-3 flex-wrap">
                  {previewUrls.map((u, i) => (
                    <img key={i} src={u} className="w-20 h-20 object-cover rounded border" alt={`preview-${i}`} />
                  ))}
                </div>
              )}

              {/* Show existing images if editing */}
              {userReviews[reviewOrder.id] && userReviews[reviewOrder.id].images && userReviews[reviewOrder.id].images.length > 0 && (
                <div className="mb-3">
                  <p className="font-medium text-sm mb-2">Existing Images:</p>
                  <div className="flex gap-2 flex-wrap">
                    {userReviews[reviewOrder.id].images.map((img, i) => (
                      <img key={i} src={img} className="w-16 h-16 object-cover rounded border" alt={`existing-${i}`} />
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <button className="border px-4 py-2 rounded" onClick={() => setReviewOrder(null)}>
                  Close
                </button>

                <button 
                  className="bg-green-600 text-white px-4 py-2 rounded" 
                  onClick={submitReview}
                  disabled={uploadingImages}
                >
                  {uploadingImages ? 'Uploading...' : (userReviews[reviewOrder.id] ? 'Update Review' : 'Submit Review')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}