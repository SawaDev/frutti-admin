import { useMutation, useQueries, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar'
import { publicRequest, userRequest } from '../utils/requestMethods';
import { Table, InputNumber } from 'antd';
import axios from 'axios';

const NewSale = () => {
  const [newQuantities, setNewQuantities] = useState({});
  const [info, setInfo] = useState({})
  const [clientId, setClientId] = useState(null);
  
  const queryClient = useQueryClient()
  const createSaleMutation = useMutation({
    mutationFn: (data) => {
      return userRequest.post("/sales", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["sales"])
    },
    onError: (error) => {
      alert(error?.response?.data.message)
    }
  })

  const navigate = useNavigate();

  const handleChange = (e) => {
    setInfo({
      ...info,
      [e.target.name]: e.target.value,
    })
  }

  function handleClientChange(event) {
    const selectedClient = clientsQuery.data.find(
      (client) => client.name === event.target.value
    );
    if (selectedClient) {
      setClientId(selectedClient._id);
    } else {
      alert("Haridor nomini kiriting!")
    }
  }

  const [clientsQuery, productsQuery] = useQueries({
    queries: [
      {
        queryKey: ['clients'],
        queryFn: () =>
          publicRequest.get(`/clients`).then((res) => res.data),
      },
      {
        queryKey: ['products'],
        queryFn: () =>
          publicRequest.get(`/products`).then((res) => res.data),
      },
    ],
  });

  if (clientsQuery.isLoading) return 'Loading Clients...';
  if (productsQuery.isLoading) return 'Loading Products...';

  if (clientsQuery.error)
    return 'An error has occurred: ' + clientsQuery.error.message;

  if (productsQuery.error)
    return 'An error has occurred: ' + productsQuery.error.message;

  const handleQuantityChange = (productId, value) => {
    setNewQuantities(prevQuantities => ({
      ...prevQuantities,
      [productId]: value
    }));
  };

  const handleSave = async () => {
    try {
      const productsToAdd = Object.entries(newQuantities).map(
        ([productId, ketdi]) => ({
          productId,
          ketdi,
        })
      );

      const filteredProducts = productsToAdd.filter((p) => p.ketdi !== null);

      const sale = {
        ...info,
        clientId,
        products: filteredProducts,
        status: "Kutilmoqda"
      };

      if (!clientId) {
        alert("Xaridorni kiriting!");
      } else if (sale?.products.length == 0) {
        alert("Mahsulot sonini kiriting!");
      } else {
        const productWithNullKetdi = sale?.products.find(
          (product) => product.ketdi === null
        );
        if (productWithNullKetdi) {
          alert("Enter the number of products");
        }
      }

      await createSaleMutation.mutateAsync(sale)

      navigate("/clients");
    } catch (err) {
      alert(err);
    }
  };

  const columns = [
    {
      title: 'Product Name',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Mollar soni',
      dataIndex: 'soni',
      key: 'soni'
    },
    {
      title: 'Soni',
      dataIndex: 'ketdi',
      key: 'ketdi',
      render: (text, record) => (
        <InputNumber
          className='w-1/2'
          min={0}
          type="number"
          defaultValue={text}
          onChange={value => handleQuantityChange(record._id, value)}
        />
      )
    },
  ];

  return (
    <div className='relative w-full'>
      <div className="fixed bg-main-bg navbar w-full">
        <Navbar />
      </div>
      <div className='max-w-7xl mx-auto pt-[100px] flex flex-col'>
        <span className="text-gray-600 text-3xl mb-6">Here you can add new sale: </span>
        <div className='flex flex-col mb-5 mx-5 bg-white py-4 px-5 shadow-lg rounded-lg'>
          <label className="text-lg font-semibold mb-2">Select Customer: </label>
          <input
            placeholder="Client Name"
            type="text"
            list='clients'
            onChange={handleClientChange}
            className="p-3 border-gray-500 border-1 outline-none rounded-lg min-w-[320px] "
          />
          <datalist id="clients">
            {clientsQuery.data.map((client) => (
              <option key={client._id} value={client?.name} />
            ))}
          </datalist>
          <label className="text-lg font-semibold mt-5 mb-2">Enter the payment: </label>
          <input
            placeholder="Payment"
            name="payment"
            onChange={handleChange}
            defaultValue={0}
            type="number"
            className="p-3 border-gray-500 border-1 outline-none rounded-lg min-w-[320px] "
          />
        </div>
        <div className='mt-8 px-5 bg-white'>
          <span className='text-xl'>Here is the list of products</span>
          <Table
            columns={columns}
            dataSource={productsQuery.data}
            bordered
            pagination={false}
          />
        </div>
        <div className='w-full flex justify-end pr-5 pt-5'>
          <button className='bg-purple-100 text-purple-600 py-4 px-6 mb-10 rounded-xl duration-100 ease-in hover:scale-110' onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  )
}

export default NewSale