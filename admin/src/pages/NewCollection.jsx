import { useMutation, useQueries, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar'
import { publicRequest, userRequest } from '../utils/requestMethods';
import { InputNumber, Table } from 'antd';

const NewCollection = () => {
  const [newQuantities, setNewQuantities] = useState({});

  const navigate = useNavigate();

  const queryClient = useQueryClient()
  const createSaleMutation = useMutation({
    mutationFn: (data) => {
      return userRequest.post("/sales/newCollection", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["sales"])
    },
    onError: (error) => {
      alert(error?.response?.data.message)
    }
  })


  const [productsQuery] = useQueries({
    queries: [
      {
        queryKey: ['products'],
        queryFn: () =>
          publicRequest.get(`/products`).then((res) => res.data),
      },
    ],
  });

  if (productsQuery.isLoading) return 'Loading Products...';

  if (productsQuery.error)
    return 'An error has occurred: ' + productsQuery.error.message;

  const handleQuantityChange = (productId, value) => {
    setNewQuantities(prevQuantities => ({
      ...prevQuantities,
      [productId]: { keldi: value }
    }));
  };

  const handleSave = async () => {
    try {
      const productsToAdd = Object.entries(newQuantities).map(
        ([productId, { keldi }]) => ({
          productId,
          keldi
        })
      );

      const filteredProducts = productsToAdd.filter((p) => p.keldi !== null);

      const sale = {
        products: filteredProducts,
      };

      if (sale?.products.length == 0) {
        alert("Mahsulot sonini kiriting!");
      } else {
        const productWithNullKetdi = sale?.products.find(
          (product) => product.keldi === null
        );
        if (productWithNullKetdi) {
          alert("Enter the number of products");
        }
      }

      await createSaleMutation.mutateAsync(sale)

      navigate("/products");
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
      title: 'Narxi',
      dataIndex: 'price',
      key: 'price'
    },
    {
      title: 'Soni',
      dataIndex: 'ketdi',
      key: 'ketdi',
      render: (text, record) => (
        <InputNumber
          className='w-[80%]'
          min={0}
          type="number"
          defaultValue={text}
          onChange={value => handleQuantityChange(record._id, value, record.price)}
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
        <span className="text-gray-600 text-3xl mb-6">Bu yerda siz yangi mollarni sonini kiritasiz: </span>
        <div className='mt-8 px-5 bg-white'>
          <span className='text-xl'>Mahsulotlar: </span>
          <Table
            columns={columns}
            dataSource={productsQuery.data}
            bordered
            pagination={false}
          />
        </div>
        <div className='w-full flex justify-end pr-5 pt-5'>
          <button className='bg-purple-100 text-purple-600 py-4 px-6 mb-10 rounded-xl duration-100 ease-in hover:scale-110' onClick={handleSave}>Saqlash</button>
        </div>
      </div>
    </div>
  )
}

export default NewCollection