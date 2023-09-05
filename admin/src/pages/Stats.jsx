import { useQueries } from '@tanstack/react-query';
import { Table, Tabs } from 'antd';
import React, { useMemo, useState } from 'react'
import Navbar from '../components/Navbar'
import { publicRequest } from '../utils/requestMethods';

const Stats = () => {
  const [clientId, setClientId] = useState("null")
  const [filter, setFilter] = useState("byMonth")

  const [clientSales, clientQuery] = useQueries({
    queries: [
      {
        queryKey: ['clients', 'monthlySales', clientId, filter],
        queryFn: () =>
          publicRequest.get(`/clients/monthlySales?id=${clientId}&filter=${filter}`).then((res) => {
            return res.data;
          }),
      },
      {
        queryKey: ['clients'],
        queryFn: () =>
          publicRequest.get(`/clients`).then((res) => res.data),
      },
    ],
  });

  const MONTHS = useMemo(
    () => [
      "Yanvar",
      "Fevral",
      "Mart",
      "Aprel",
      "May",
      "Iyun",
      "Iyul",
      "August",
      "Sentabr",
      "Oktabr",
      "Noyabr",
      "Dekabr",
    ],
    []
  );

  const column = [
    {
      title: "",
      key: "img",
      width: 80,
      render: (_, record) => (
        <img className="rounded-full h-8 w-8 object-contain" src={record.product.img} />
      ),
    },
    {
      title: "Nomi",
      key: "name",
      width: 100,
      render: (_, record) => <p>{record.product.name}</p>,
    },
    {
      title: "Qiymati",
      dataIndex: "monthlyCost",
      width: 120,
      render: (text) => <p>{parseInt(text).toLocaleString("fr-fr")}</p>
    },
    {
      title: "Soni",
      dataIndex: "monthlyKetdi",
      width: 120,
      render: (text) => <p>{parseInt(text).toLocaleString("fr-FR")}</p>,
    },
  ];


  if (clientSales.isLoading) return "Loading Clientsales..."
  if (clientQuery.isLoading) return "Loading Client..."

  if (clientQuery.error)
    return 'An error has occurred: ' + clientQuery.error.message;

  if (clientSales.error)
    return 'An error has occurred: ' + clientSales.error.message;

  const sales = clientSales?.data.sort((a, b) => {
    return b._id - a._id
  })

  const items = [
    {
      key: "byMonth",
      label: "Oy Bo'yicha",
      children: (
        <>
          {sales.map((s) => {
            const sortedProducts = s.products.sort((a, b) => {
              return b.monthlyCost - a.monthlyCost
            })
            return (
              <div key={filter === "byMonth" ? s._id : s._id.startDate}>
                <div className='py-2 text-xl flex gap-8 mt-3'>
                  <p>Oy: <span className='font-semibold'>{MONTHS[s._id - 1]}</span></p>
                  <p>To'lov: <span className='font-semibold'>{parseInt(s.payment).toLocaleString("fr-FR")}</span></p>
                  <p>Summa: <span className='font-semibold'>{parseInt(s.summa).toLocaleString("fr-FR")}</span></p>
                  <p>Soni: <span className='font-semibold'>{parseInt(s.sumSoni).toLocaleString("fr-FR")}</span></p>
                </div>
                <div>
                  <Table
                    dataSource={sortedProducts}
                    columns={column}
                    pagination={false}
                  />
                </div>
              </div>
            )
          })}
        </>
      )
    },
    {
      key: "byHalfMonth",
      label: "Oy O'rtasi",
      children: (
        <>
          {sales.map((s) => {
            const sortedProducts = s.products.sort((a, b) => {
              return a.payment - b.payment
            })
            return (
              <div key={filter === "byMonth" ? s._id : s._id.startDate}>
                <div className='py-2 text-xl flex gap-8 mt-3'>
                  <p>Oy: 15&nbsp;
                    <span className='font-semibold'>{MONTHS[s._id.startMonth - 1]}</span>&nbsp;
                    -&nbsp;15 <span className='font-semibold'>{MONTHS[s._id.nextMonth - 1]}</span>
                  </p>
                  <p>To'lov: <span className='font-semibold'>{parseInt(s.payment).toLocaleString("fr-FR")}</span></p>
                  <p>Summa: <span className='font-semibold'>{parseInt(s.summa).toLocaleString("fr-FR")}</span></p>
                  <p>Soni: <span className='font-semibold'>{parseInt(s.sumSoni).toLocaleString("fr-FR")}</span></p>
                </div>
                <div>
                  <Table
                    dataSource={sortedProducts}
                    columns={column}
                    pagination={false}
                  />
                </div>
              </div>
            )
          })}
        </>
      )
    }
  ]

  return (
    <div>
      <div className="fixed bg-main-bg navbar w-full">
        <Navbar />
      </div>
      <div className='flex justify-between items-center px-6 pt-[100px]'>
        <div className=''>
          <label className='text-xl mr-5'>Klientni tanlang: </label>
          <select
            onChange={(e) => {
              setClientId(e.target.value);
            }}
            value={clientId}
            className='px-3 py-2 bg-gray-100 shadow-md'
          >
            <option value="null">Barchasi</option>
            {clientQuery.data &&
              clientQuery.data.map((c) => (
                <option value={c._id} key={c._id}>
                  {c.name}
                </option>
              ))}
          </select>
        </div>
      </div>
      <div className='mt-5 px-8'>
        <Tabs
          defaultActiveKey={filter}
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

export default Stats