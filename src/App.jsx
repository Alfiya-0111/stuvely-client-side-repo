import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';

// Pages
import Home from './pages/Home';
import Login from './pages/loginlist/Login';
import Signup from './pages/loginlist/Signup';
import Ourcollection from './pages/ourcollection/Ourcollection';
import SingleCollection from './pages/ourcollection/SingleCollection';
import SingleProduct from './pages/ourcollection/SingleProduct';
import Cart from './pages/cart/Cart';
import OfferSlider from './pages/Offersliders/Offerslider';
import OfferProduct from './pages/Offersliders/OfferProduct';
import OfferSingleProduct from './pages/Offersliders/OfferSingleProduct';
import SingleProducts from './pages/bestdeals/SingleProducts';
import CategoriesClient from './pages/bestdeals/CategoriesClient';
import CategoryProducts from './pages/bestdeals/CategoryProducts';
import Carcollection from './pages/car/Carcollection';
import SingleCarPage from './pages/car/SingleCarPage';
import Keychainsproducts from './pages/keychains/Keychainsproducts';
import Keychainsproductinfo from './pages/keychains/Keychainsproductinfo';

// Client Components
import Footer from './component/Footer';
import DynamicPage from './pages/DynamicPage';
import Orders from './pages/order/Orders';
import MyProfile from './pages/Navpages/MyProfile';
import Wishlist from './pages/Navpages/Wishlist';
import Checkout from './pages/checkout/Checkout';
import ResetPassword from './pages/loginlist/ResetPassword';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Home & Auth */}
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='/reset-password' element={<ResetPassword/>}/>

        {/* Collections */}
        <Route path="/collections" element={<Ourcollection />} />
        <Route path="/collections/:slug" element={<SingleCollection />} />
        <Route path="/collections/:slug/product/:productId" element={<SingleProduct />} />

        {/* Cart */}
        <Route path='/cart' element={<Cart />} />

        {/* Offers */}
        <Route path='/offer' element={<OfferSlider />} />
        <Route path="/offers/:slug" element={<OfferProduct />} />
        <Route path='/product/:sliderSlug/:productId' element={<OfferSingleProduct />} />

        {/* Best Deals */}
        <Route path='/bestdeals' element={<CategoriesClient />} />
        <Route path='/bestdeals/:offerId' element={<CategoryProducts />} />
        <Route path='/bestdeals/:offerId/product/:productId' element={<SingleProducts />} />

        {/* New Arrivals (Cars) */}
        <Route path='/new-arrivals' element={<Carcollection />} />
        <Route path='/new-arrivals/:productId' element={<SingleCarPage />} />

        {/* Keychains */}
        <Route path='/keychains' element={<Keychainsproducts />} />
        <Route path='/keychains/:carId' element={<Keychainsproductinfo />} />

        <Route path='/checkout' element={<Checkout/>}/>

        {/* Dynamic Pages */}
        <Route path='/page/:slug' element={<DynamicPage />} />
        <Route path='orders' element={<Orders/>}/>
        <Route path="profile" element={<MyProfile/>}/>
        <Route path='wishlist' element={<Wishlist/>}/>

        {/* Catch-all */}
        <Route path='*' element={<div className="text-center mt-20">404 - Page not found</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
