import { useMutation, useQueries, useQueryClient } from '@tanstack/react-query'
import { Table, Tabs } from 'antd'
import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { publicRequest, userRequest } from '../utils/requestMethods'
import ReactLoading from "react-loading"
import Navbar from '../components/Navbar'
import { useEffect } from 'react'

const Sales = () => {
  const location = useLocation()
  const path = location.pathname.split('/')[1]

  const [date, setDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [clientId, setClientId] = useState(null)
  const [filter, setFilter] = useState('grouped');

  const [salesQuery, salesGrouped, clientsQuery] = useQueries({
    queries: [
      {
        queryKey: [path, date, endDate, clientId, "notgrouped"],
        queryFn: () =>
          publicRequest.get(`/${path}?date=${date}&endDate=${endDate}&clientId=${clientId}&type=notgrouped`).then((res) => {
            return res.data;
          }),
      },
      {
        queryKey: [path, date, endDate, clientId, "grouped"],
        queryFn: () =>
          publicRequest.get(`/${path}?date=${date}&endDate=${endDate}&clientId=${clientId}&type=grouped`).then((res) => {
            return res.data;
          }),
      },
      {
        queryKey: ['clients'],
        queryFn: () =>
          publicRequest.get(`/clients`).then((res) => res.data),
      },
    ]
  });

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id) => {
      return userRequest.delete(`/sales/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['sales'])
      alert("Muvaffaqiyatli o'chirildi!")
    },
    onError: (err) => {
      alert(err?.response);
      console.log(err?.response);
    }
  })

  const handleDelete = (id) => {
    mutation.mutate(id)
  }

  const productColumns = [
    {
      title: 'Rasmi',
      dataIndex: 'img',
      key: 'img',
      width: 100,
      render: (_, record) => (
        <>
          <img src={record?.img} width={24} height={24} />
        </>
      )
    },
    {
      title: 'Nomi',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: 'Soni',
      dataIndex: 'ketdi',
      key: 'ketdi',
      width: 100,
    },
    {
      title: 'Narxi',
      dataIndex: 'priceOfProduct',
      key: 'priceOfProduct',
      width: 100,
      render: (_, record) => (
        <p>{parseInt(record?.priceOfProduct).toLocaleString("fr-fr")}</p>
      )
    }
  ]

  const groupedProductColumns = [
    {
      title: 'Rasmi',
      key: 'img',
      width: 100,
      render: (_, record) => (
        <>
          <img src={record?.product?.img} width={24} height={24} />
        </>
      )
    },
    {
      title: 'Nomi',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      render: (_, record) => (<p>{record?.product?.name}</p>)
    },
    {
      title: 'Soni',
      dataIndex: 'ketdi',
      key: 'ketdi',
      width: 100,
      render: (_, record) => (<p>{record?.ketdi}</p>)
    },
    {
      title: 'Summa',
      key: 'summa',
      width: 100,
      render: (_, record) => (
        <p>{parseInt(record?.summa).toLocaleString("fr-fr")}</p>
      )
    }
  ]

  if (clientsQuery.isLoading) return (
    <div className='text-purple-500 h-screen w-full grid place-items-center'>
      <ReactLoading type="spinningBubbles" color="rgb(168 85 247)" />
    </div>
  );

  if (salesQuery.error) return <p>Serverda xatolik</p>

  const items = [
    {
      key: "notgrouped",
      label: "Guruhlanmagan",
      children: (
        <>
          {salesQuery.isLoading
            ? (
              <div className='text-purple-500 h-screen w-full grid place-items-center'>
                <ReactLoading type="spinningBubbles" color="rgb(168 85 247)" />
              </div>
            )
            : (
              <>
                {
                  salesQuery.data?.length === 0 ? (
                    <div className='text-3xl font-bold'>{date} da xarid bo'lmagan</div>
                  ) : salesQuery.data.map((sale) => (
                    <div key={sale.createdAtDate}>
                      <h1 className='mt-6'>{sale.createdAtDate}</h1>
                      {sale.sales.sort((a, b) => { return b.createdAt - a.createdAt }).map((s) => (
                        <div key={s._id}>
                          <div className='flex items-center gap-8 mt-4 text-xl font-semibold'>
                            <p className=''>{s?.client?.name}</p>
                            <p className=''>To'lov: <span>{parseInt(s?.payment).toLocaleString("fr-fr")}</span></p>
                            <p className=''>Summa: <span>{parseInt(s?.summa).toLocaleString("fr-fr")}</span></p>
                            <p className=''>Soni: <span>{parseInt(s?.sumSoni).toLocaleString("fr-fr")}</span></p>
                            <p>Hisob (keyin): <span className={s?.cashAfter < 0 ? 'text-red-500' : 'text-green-500'}>{parseInt(s?.cashAfter).toLocaleString("fr-fr")}</span></p>
                            <p>Hisob (oldin): <span className={s?.cashBefore < 0 ? 'text-red-500' : 'text-green-500'}>{parseInt(s?.cashBefore).toLocaleString("fr-fr")}</span></p>
                          </div>
                          <Table
                            dataSource={s?.products?.sort((a, b) => {
                              return b.ketdi - a.ketdi;
                            })}
                            pagination={false}
                            columns={productColumns}
                          />
                        </div>
                      ))}
                    </div>
                  ))
                }
              </>
            )
          }
        </>
      )
    },
    {
      key: "grouped",
      label: "Guruhlangan",
      children: (
        <>
          {salesGrouped.isLoading
            ? (
              <div className='text-purple-500 h-screen w-full grid place-items-center'>
                <ReactLoading type="spinningBubbles" color="rgb(168 85 247)" />
              </div>
            )
            : (
              <>
                {
                  salesGrouped.data.length === 0 ? (
                    <p className='text-xl font-semibold'>{date} da sotuv bo'lmagan</p>
                  ) : (
                    <>
                      {salesGrouped.data.sort((a, b) => { return b.createdAtDate - a.createdAtDate }).map((date) => {
                        return (
                          <div className='pt-4' key={date?.createdAtDate}>
                            <div className='flex items-center gap-10 text-lg'>
                              <span className='font-semibold'>{date?.createdAtDate}</span>
                              <p className=''>Soni: <span className='font-semibold'>{parseInt(date?.sumKetdi).toLocaleString("fr-fr")}</span></p>
                              <p className=''>Summa: <span className='font-semibold'>{parseInt(date?.summa).toLocaleString("fr-fr")}</span></p>
                            </div>
                            {date?.clients.sort((a, b) => { return b.overallSumma - a.overallSumma }).map((client) => {
                              return (
                                <div key={client?._id.clientId}>
                                  <div className='pt-3 flex items-center gap-6'>
                                    <span className='font-semibold'>{client?.client.name}</span>
                                    <p className=''>Soni: <span className='font-semibold'>{parseInt(client?.sumKetdi).toLocaleString("fr-fr")}</span></p>
                                    <p className=''>Summa: <span className='font-semibold'>{parseInt(client?.overallSumma).toLocaleString("fr-fr")}</span></p>
                                  </div>
                                  <Table
                                    dataSource={client?.products.sort((a, b) => { return b.summa - a.summa })}
                                    columns={groupedProductColumns}
                                    pagination={false}
                                  />
                                </div>
                              )
                            })}
                          </div>
                        )
                      })}
                    </>
                  )
                }
              </>
            )
          }
        </>
      )
    }
  ]

  return (
    <div>
      <div className="fixed bg-main-bg navbar w-full">
        <Navbar />
      </div>
      <div className="pt-[100px] px-4">
        <div className='pb-3 flex justify-between'>
          <p className='font-semibold text-2xl capitalize'>
            Sotuvlar
          </p>
          <Link to={`/newsale`}>
            <div className='py-2 px-4 border-2 border-blue-500 text-blue-500 rounded-2xl'>Yangi</div>
          </Link>
        </div>
        <div className='flex justify-start'>
          <div className='basis-2/5'>
            <label className='mr-6'>Boshlang'ich kunni tanlang: </label>
            <input type="date" name="date" className="bg-gray-100 p-2 rounded" value={date} onChange={event => setDate(event.target.value)} />
          </div>
          <div className='basis-1/4'>
            <label className='mr-6'>Ohirgi kunni tanlang: </label>
            <input type="date" name="date" className="bg-gray-100 p-2 rounded" value={endDate} onChange={event => setEndDate(event.target.value)} />
          </div>
          <div className=''>
            <label htmlFor="client" className='mr-6'>Haridorni tanlash:</label>
            <select
              id="client"
              name="client"
              className='cursor-pointer border-2 border-black rounded-md py-2 px-4 capitalize'
              onChange={event => setClientId(event.target.value)}
              value={clientId}
            >
              <option value="null">null</option>
              {clientsQuery?.data.map((client) => (
                <option value={client._id} key={client._id}>{client?.name}</option>
              ))}
            </select>
          </div>
        </div>

        <Tabs
          defaultActiveKey="notgrouped"
          style={{
            marginBottom: 32,
          }}
          items={items}
          onChange={(e) => setFilter(e)}
        />

      </div>
    </div>
  )
}

export default Sales