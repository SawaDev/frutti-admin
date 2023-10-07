import { useMutation, useQueries, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar'
import { publicRequest, userRequest } from '../utils/requestMethods';
import { InputNumber, Table, Radio } from 'antd';
import ReactLoading from 'react-loading';

const NewSale = () => {
  const [newQuantities, setNewQuantities] = useState({});
  const [newPrice, setNewPrice] = useState({});
  const [info, setInfo] = useState({
    payment: 0
  })
  const [clientId, setClientId] = useState(null);
  const [loading, setLoading] = useState(false)

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
    if (e.target.name === "payment") {
      const numericValue = e.target.value.replace(/\D/g, '');
      setInfo({
        ...info,
        payment: Number(numericValue)
      })
    } else {
      setInfo({
        ...info,
        [e.target.name]: e.target.value,
      })
    }
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

  if (clientsQuery.isLoading || productsQuery.isLoading) return (
    <div className='text-purple-500 h-screen w-full grid place-items-center'>
      <ReactLoading type="spinningBubbles" color="rgb(168 85 247)" />
    </div>
  )

  if (clientsQuery.error)
    return 'An error has occurred: ' + clientsQuery.error.message;

  if (productsQuery.error)
    return 'An error has occurred: ' + productsQuery.error.message;

  const handleQuantityChange = (productId, value, defaultPrice) => {
    setNewQuantities(prevQuantities => ({
      ...prevQuantities,
      [productId]: { ketdi: value, price: defaultPrice }
    }));
  };

  const handlePriceChange = (productId, value) => {
    setNewPrice(prevQuantities => ({
      ...prevQuantities,
      [productId]: value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const productsToAdd = Object.entries(newQuantities).map(
        ([productId, { ketdi, price }]) => ({
          productId,
          ketdi,
          price
        })
      );

      const pricesToAdd = Object.entries(newPrice).map(
        ([productId, price]) => ({
          productId,
          price
        })
      );

      const filteredProducts = productsToAdd.filter((p) => p.ketdi !== null);
      const filteredPrices = pricesToAdd.filter((p) => p.ketdi !== null);

      const mergedArray = filteredProducts.map((item1) => {
        const item = filteredPrices.find((item2) => item1.productId === item2.productId)
        if (item?.price !== null && item?.price !== undefined) {
          return { productId: item1.productId, ketdi: item1.ketdi, priceOfProduct: item.price }
        }

        return { productId: item1.productId, ketdi: item1.ketdi, priceOfProduct: item1.price }
      })

      const sale = {
        ...info,
        clientId,
        products: mergedArray,
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

      setLoading(false)
      navigate("/clients");
    } catch (err) {
      setLoading(false)
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
      title: 'Yangi narx',
      dataIndex: 'ketdi',
      key: 'ketdi',
      render: (text, record) => (
        <InputNumber
          className='w-[80%]'
          min={0}
          type="number"
          defaultValue={text}
          onChange={value => handlePriceChange(record._id, value)}
        />
      )
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

  if (loading) return (
    <div className='text-purple-500 h-screen w-full grid place-items-center'>
      <ReactLoading type="spinningBubbles" color="rgb(168 85 247)" />
    </div>
  );

  return (
    <div className='relative w-full'>
      <div className="fixed bg-main-bg navbar w-full">
        <Navbar />
      </div>
      <div className='max-w-7xl mx-auto pt-[100px] flex flex-col'>
        <span className="text-gray-600 text-3xl mb-6">Bu yerda siz yangi sotuvni kiritasiz: </span>
        <div className='flex flex-col mb-5 mx-5 bg-white py-4 px-5 shadow-lg rounded-lg'>
          <label className="text-lg font-semibold mb-2">Xaridorni tanlang: </label>
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
          <div className='grid grid-cols-2 gap-8 mt-5 mb-2'>
            <div className='flex flex-col gap-2'>
              <label className="text-lg font-semibold">To'lovni kiriting: </label>
              <input
                placeholder="Payment"
                name="payment"
                onChange={handleChange}
                value={parseInt(info["payment"]).toLocaleString('fr-FR')}
                type="text"
                className="p-3 border-gray-500 border-1 outline-none rounded-lg min-w-[320px] "
              />
            </div>
            <div className='flex flex-col w-full gap-2'>
              <label className="text-lg font-semibold">Skidkami: </label>
              <Radio.Group onChange={handleChange} name="discount" defaultValue={false} buttonStyle="solid">
                <Radio.Button value={true}>Ha</Radio.Button>
                <Radio.Button value={false}>Yo'q</Radio.Button>
              </Radio.Group>

            </div>
          </div>
        </div>
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
          <button
            className='bg-purple-100 text-purple-600 py-4 px-6 mb-10 rounded-xl duration-100 ease-in hover:scale-110'
            onClick={handleSave}
            disabled={createSaleMutation.isLoading}
          >
            Saqlash
          </button>
        </div>
      </div>
    </div>
  )
}

export default NewSale