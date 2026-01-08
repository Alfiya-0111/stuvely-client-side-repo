import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref as dbRef, onValue, set, push, remove, update } from "firebase/database";
import { auth, db } from "../../firebaseConfig";
import Layout from "../../component/Layout";

export default function MyProfileHM() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit profile
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ fullName: "", phone: "", gender: "", dob: "" });
  const fileInputRef = useRef();

  // Addresses
  const [addresses, setAddresses] = useState([]);
  const [addrModalOpen, setAddrModalOpen] = useState(false);
  const [addrForm, setAddrForm] = useState({ label: "Home", line1: "", city: "", state: "", pincode: "" });
  const [editingAddrId, setEditingAddrId] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
        const usersRef = dbRef(db, `users/${u.uid}`);
        onValue(usersRef, (snap) => {
          const data = snap.val() || {};
          setUserData(data);
          setForm({
            fullName: data.fullName || data.name || u.displayName || "",
            phone: data.phone || "",
            gender: data.gender || "",
            dob: data.dob || "",
          });
          setAddresses(data.addresses ? Object.entries(data.addresses).map(([id, a]) => ({ id, ...a })) : []);
          setLoading(false);
        });
      } else {
        setUser(null);
        setUserData(null);
        setLoading(false);
        navigate("/login");
      }
    });

    return () => unsub();
  }, [navigate]);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const saveProfile = async () => {
    if (!user) return;
    const dataToSave = { ...form };
    await set(dbRef(db, `users/${user.uid}/profile`), dataToSave);
    await update(dbRef(db, `users/${user.uid}`), dataToSave);
    setEditing(false);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    try {
      const toBase64 = (file) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result.split(",")[1]);
          reader.onerror = (err) => reject(err);
        });
      const base64Image = await toBase64(file);
      const formData = new FormData();
      formData.append("image", base64Image);

      const IMGBB_API_KEY = "c6c5e693c5db472ff556165ec44510e8";
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!data.success) return alert("ImgBB Upload Failed");

      const imageUrl = data.data.url;
      await update(dbRef(db, `users/${user.uid}`), { profilePic: imageUrl });
      alert("Profile photo updated!");
    } catch (err) {
      console.error("ImgBB Upload Error:", err);
    }
  };

  const openAddAddress = () => {
    setAddrForm({ label: "Home", line1: "", city: "", state: "", pincode: "" });
    setEditingAddrId(null);
    setAddrModalOpen(true);
  };

  const editAddress = (a) => {
    setAddrForm({ label: a.label, line1: a.line1, city: a.city, state: a.state, pincode: a.pincode });
    setEditingAddrId(a.id);
    setAddrModalOpen(true);
  };

  const saveAddress = async () => {
    if (!user) return;
    const addressesRef = dbRef(db, `users/${user.uid}/addresses`);
    if (editingAddrId) {
      await update(dbRef(db, `users/${user.uid}/addresses/${editingAddrId}`), addrForm);
    } else {
      const newRef = push(addressesRef);
      await set(newRef, addrForm);
    }
    setAddrModalOpen(false);
  };

  const deleteAddress = async (id) => {
    if (!user) return;
    await remove(dbRef(db, `users/${user.uid}/addresses/${id}`));
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 px-6 py-8 font-sans">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="col-span-1 bg-white rounded-lg p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-4">
              <img src={userData?.profilePic || "https://via.placeholder.com/80"} alt="avatar" className="w-16 h-16 rounded-full object-cover" />
              <div>
                <p className="text-sm text-gray-400">Hello,</p>
                <h2 className="font-medium text-gray-900">{userData?.fullName || user.displayName || user.email?.split("@")[0]}</h2>
              </div>
            </div>
            <nav className="flex flex-col gap-2 text-sm">
              <Link to="/profile" className="hover:underline text-gray-900">My Profile</Link>
              <button onClick={() => navigate("/orders")} className="hover:underline text-gray-900 text-left">Orders</button>
              <button onClick={() => navigate("/wishlist")} className="hover:underline text-gray-900 text-left">Wishlist</button>
              <button onClick={() => navigate("/saved/cards")} className="hover:underline text-gray-900 text-left">Saved Cards</button>
              <button onClick={() => navigate("/addresses")} className="hover:underline text-gray-900 text-left">Addresses</button>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="md:col-span-3 space-y-8">
            {/* Profile Header */}
            <div className="bg-white p-6 rounded-lg shadow-sm flex flex-col md:flex-row items-center gap-6">
              <img src={userData?.profilePic || "https://via.placeholder.com/120"} alt="profile" className="w-28 h-28 rounded-full object-cover border" />
              <div className="flex-1">
                <h1 className="text-2xl font-light text-gray-900">{userData?.fullName || user.displayName || "User"}</h1>
                <p className="text-gray-500">{user.email}</p>
                <p className="text-gray-400 mt-1">{userData?.phone || "No phone added"}</p>
              </div>
              <div className="flex gap-2">
                <label className="cursor-pointer border px-4 py-2 rounded hover:bg-gray-100 transition">
                  <input ref={fileInputRef} type="file" onChange={handleFileChange} className="hidden" />
                  Change Photo
                </label>
                <button onClick={() => setEditing(true)} className="px-4 py-2 border rounded hover:bg-gray-100 transition">Edit</button>
              </div>
            </div>

            {/* Personal Details */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-light text-gray-900 mb-4">Personal Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-400 text-xs">Full Name</p>
                  <p className="text-gray-900">{userData?.fullName || "Not added"}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Mobile</p>
                  <p className="text-gray-900">{userData?.phone || "Not added"}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Email</p>
                  <p className="text-gray-900">{user.email}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Gender</p>
                  <p className="text-gray-900">{userData?.gender || "Not added"}</p>
                </div>
              </div>
            </div>

            {/* Addresses */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-light text-gray-900">Saved Addresses</h2>
                <button onClick={openAddAddress} className="px-3 py-1 border rounded hover:bg-gray-100">Add Address</button>
              </div>
              <div className="space-y-3">
                {addresses.length ? (
                  addresses.map((a) => (
                    <div key={a.id} className="border rounded p-4 flex justify-between items-start hover:shadow-sm transition">
                      <div>
                        <p className="font-medium text-gray-900">{a.label}</p>
                        <p className="text-gray-500 text-sm">{a.line1}</p>
                        <p className="text-gray-400 text-sm">{a.city}, {a.state} - {a.pincode}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => editAddress(a)} className="text-gray-900 border px-3 py-1 rounded hover:bg-gray-100 transition">Edit</button>
                        <button onClick={() => deleteAddress(a.id)} className="text-red-500 border px-3 py-1 rounded hover:bg-red-100 transition">Delete</button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm">No addresses saved yet.</p>
                )}
              </div>
            </div>
          </main>
        </div>

        {/* Edit Modal */}
        {editing && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-2xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-light text-gray-900">Edit Profile</h3>
                <button onClick={() => setEditing(false)} className="text-gray-400">Close</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input name="fullName" value={form.fullName} onChange={handleChange} className="border p-2 rounded" placeholder="Full Name" />
                <input name="phone" value={form.phone} onChange={handleChange} className="border p-2 rounded" placeholder="Phone" />
                <select name="gender" value={form.gender} onChange={handleChange} className="border p-2 rounded">
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                <input type="date" name="dob" value={form.dob} onChange={handleChange} className="border p-2 rounded" />
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button onClick={() => setEditing(false)} className="px-4 py-2 border rounded hover:bg-gray-100">Cancel</button>
                <button onClick={saveProfile} className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800">Save</button>
              </div>
            </div>
          </div>
        )}

        {/* Address Modal */}
        {addrModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-light text-gray-900">{editingAddrId ? "Edit Address" : "Add Address"}</h3>
                <button onClick={() => setAddrModalOpen(false)} className="text-gray-400">Close</button>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                <input value={addrForm.label} onChange={(e) => setAddrForm((p) => ({ ...p, label: e.target.value }))} className="border p-2 rounded" placeholder="Label" />
                <input value={addrForm.line1} onChange={(e) => setAddrForm((p) => ({ ...p, line1: e.target.value }))} className="border p-2 rounded" placeholder="Address" />
                 </div>
                <div className="grid grid-cols-2 gap-2">
                  <input value={addrForm.city} onChange={(e) => setAddrForm((p) => ({ ...p, city: e.target.value }))} className="border p-2 rounded" placeholder="City" />
                  <input value={addrForm.state} onChange={(e) => setAddrForm((p) => ({ ...p, state: e.target.value }))} className="border p-2 rounded" placeholder="State" />
                </div>
                <input value={addrForm.pincode} onChange={(e) => setAddrForm((p) => ({ ...p, pincode: e.target.value }))} className="border p-2 rounded" placeholder="Pincode" />
                <div className="flex justify-end gap-2">
                  <button onClick={() => setAddrModalOpen(false)} className="px-4 py-2 border rounded hover:bg-gray-100">Cancel</button>
                  <button onClick={saveAddress} className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800">Save</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
