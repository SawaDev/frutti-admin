import { Routes, Route, Navigate, HashRouter } from "react-router-dom";

import './App.css'
import Home from './pages/Home';
import Login from './pages/Login';
import List from "./pages/List";
import SingleProduct from "./pages/SingleProduct";
import NewProduct from "./pages/NewProduct";
import NewClient from "./pages/NewClient";
import SingleClient from "./pages/SingleClient";
import NewSale from "./pages/NewSale";
import Sales from "./pages/Sales";
import Stats from "./pages/Stats";
import NewCollection from "./pages/NewCollection";
import NewExpense from "./pages/NewExpense";
import Transactions from "./pages/Transactions";

function App() {
  const user = JSON.parse(localStorage.getItem("currentUser"));

  return (
    <HashRouter>
      {user ? (
        <Routes>
          <Route path="/" exact element={<Home />} />
          <Route path="/products" element={<List />} />
          <Route path="/clients" element={<List />} />
          <Route path="/expenses" element={<List />} />
          <Route path="/newsale" element={<NewSale />} />
          <Route path="/newCollection" element={<NewCollection />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/products/new" element={<NewProduct />} />
          <Route path="/clients/new" element={<NewClient />} />
          <Route path="/expenses/new" element={<NewExpense />} />
          <Route path="/products/:id" element={<SingleProduct />} />
          <Route path="/clients/:id" element={<SingleClient />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/*" element={<Navigate to="/" />} />
        </Routes>
      ) : (
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={<Navigate to="/login" />} />
        </Routes>
      )}
    </HashRouter>
  )
}

export default App
