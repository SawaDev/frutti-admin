import React, { useEffect, useState } from 'react'
import { useLocation } from "react-router-dom"
import { useQueries } from '@tanstack/react-query'
import { Table } from "antd"

import { publicRequest } from '../utils/requestMethods'
import Navbar from '../components/Navbar'
import Barchart from '../components/charts/Barchart'

const SingleProduct = () => {
  const location = useLocation();
  const id = location.pathname.split("/")[2];
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const [product, sales] = useQueries({
    queries: [
      {
        queryKey: ["products", id],
        queryFn: () =>
          publicRequest.get(`/products/find/${id}`).then((res) => {
            return res.data;
          }),
        onError: (err) => {
          console.log("Error: ", err)
        }
      },
      {
        queryKey: ["sales", id, startDate, endDate],
        queryFn: () =>
          publicRequest.get(`/sales/${id}/daily?start=${startDate}&end=${endDate}`).then((res) => {
            return res.data;
          }),
        onError: (err) => {
          console.log("Error: ", err)
        }
      },
    ],
  });

  useEffect(() => {
    const date = new Date()
    //keyingi kun uchun
    const nextDate = new Date(date);
    nextDate.setDate(date.getDate() + 1);
    const nextYear = nextDate.getFullYear();
    const nextEndMonth = (nextDate.getMonth() + 1).toString().padStart(2, '0');
    const nextDay = nextDate.getDate().toString().padStart(2, '0');
    //start day uchun
    const year = date.getFullYear()
    const day = date.getDate().toString().padStart(2, '0');
    const endFullDate = `${nextYear}-${nextEndMonth}-${nextDay}`
    setEndDate(endFullDate)

    const startMonth = date.getMonth().toString().padStart(2, '0');
    const startFullDate = `${startMonth === '00' ? year - 1 : year}-${startMonth === '00' ? '12' : startMonth}-${day}`

    setStartDate(startFullDate)
  }, [])

  const column = [
    {
      title: 'Kun',
      dataIndex: '_id',
    },
    {
      title: 'Sotildi',
      dataIndex: 'totalKetdi',
    },
    {
      title: 'Summasi',
      dataIndex: 'totalCost',
      render: (text) => (
        <p>{parseInt(text).toLocaleString('fr-fr')}</p>
      )
    },
    {
      title: 'Sof Foyda',
      dataIndex: 'totalProfit',
      render: (text) => (
        <p>{parseInt(text).toLocaleString('fr-Fr')}</p>
      )
    },
    {
      title: 'Chiqarildi',
      dataIndex: 'totalKeldi',
    },
  ]

  return (
    <>
      <div className='flex relative'>
        <div className='w-full'>
          <div className="fixed bg-main-bg navbar w-full">
            <Navbar />
          </div>
          {product.isLoading ? "Loading..." : (
            <>
              <div className="grid lg:grid-cols-2 grid-rows-2 lg:grid-rows-1 h-fit w-full gap-8 px-3 mb-4 mt-20 md:mt-24">
                <div className="shadow-lg p-5 relative">
                  <div className="text-purple-600 font-bold absolute t-0 l-0 p-1 pr-4 bg-purple-200 rounded rounded-br-2xl ">Info</div>
                  <h1 className="text-center py-4 text-lg text-gray-600">Info</h1>
                  <div className="flex flex-col gap-5 items-center text-center md:flex-row md:justify-around md:text-left">
                    <img
                      src={product.data?.img ? product.data.img : "https://us.123rf.com/450wm/mathier/mathier1905/mathier190500002/134557216-no-thumbnail-image-placeholder-for-forums-blogs-and-websites.jpg?ver=6"}
                      alt="no image"
                      className="object-contain rounded-lg w-44 h-44"
                    />
                    <div>
                      <h1 className="mb-3 text-gray-500 text-lg capitalize">{product.data?.name}</h1>
                      <div className="mb-2.5 text-md">
                        <span className="font-bold text-gray-400">Narxi: </span>
                        <span className="font-light">{product.data?.price}</span>
                      </div>
                      <div className="mb-2.5 text-md">
                        <span className="font-bold text-gray-400">Tan Narxi: </span>
                        <span className="font-light">{product.data?.tanNarxi}</span>
                      </div>
                      <div className="mb-2.5 text-md">
                        <span className="font-bold text-gray-400">Soni: </span>
                        <span className="font-light">{product.data?.soni}</span>
                      </div>
                      {product.data?.desc &&
                        <div className="mb-2.5 text-md">
                          <span className="font-bold text-gray-400">Description: </span>
                          <span className="font-light">{product.data?.desc}</span>
                        </div>
                      }
                    </div>
                  </div>
                </div>
                <div className="shadow-lg  w-full">
                  <Barchart data={sales?.data?.sales} isLoading={sales.isLoading} />
                </div>
              </div>

              <div className="grid px-5 gap-8 mb-10 lg:grid-cols-2">
                <div className="shadow-lg p-2 flex items-center">
                  <ul className="flex flex-wrap flex-row w-full justify-around gap-5">
                    <li className="flex items-center px-1 mb-1">
                      <label htmlFor="start-date" className="w-25 mr-3">Boshlang'ich kun: </label>
                      <input type="date" name="start-date" className="bg-gray-100 p-2 rounded" value={startDate} onChange={event => setStartDate(event.target.value)} />
                    </li>
                    <li className="flex items-center px-1 mb-1">
                      <label htmlFor="end-date" className="w-25 mr-3">Ohirgi kun:</label>
                      <input type="date" name="end-date" className="bg-gray-100 p-2 rounded" value={endDate} onChange={event => setEndDate(event.target.value)} />
                    </li>
                  </ul>
                </div>
              </div>
              <div className='px-8 pb-5 shadow-lg'>
                <div className='flex gap-8 pb-3'>
                  <p className='text-lg'>Jami Sotildi: <span className='font-semibold'>{parseInt(sales?.data?.salesAllSummed?.totalKetdi).toLocaleString('fr-fr')}</span></p>
                  <p className='text-lg'>Summasi: <span className='font-semibold'>{parseInt(sales?.data?.salesAllSummed?.totalCost).toLocaleString('fr-fr')}</span></p>
                  <p className='text-lg'>Sof Foyda: <span className='font-semibold'>{parseInt(sales?.data?.salesAllSummed?.totalProfit).toLocaleString('fr-fr')}</span></p>
                  <p className='text-lg'>Jami Chiqarildi: <span className='font-semibold'>{parseInt(sales?.data?.salesAllSummed?.totalKeldi).toLocaleString('fr-fr')}</span></p>
                </div>
                <Table
                  dataSource={sales?.data?.sales}
                  columns={column}
                  pagination={true}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default SingleProduct