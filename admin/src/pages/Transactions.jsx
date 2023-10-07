import { useQueries } from '@tanstack/react-query';
import { Radio, Table, Tabs } from 'antd';
import React, { useEffect, useMemo, useState } from 'react'
import Navbar from '../components/Navbar'
import dateFormat from '../utils/functions';
import { publicRequest } from '../utils/requestMethods';

const Transactions = () => {
  const [filter, setFilter] = useState("credit")
  const [cardId, setCardId] = useState('64f7682d5e4645990d0393f9')
  const [type, setType] = useState('credit')
  const [info, setInfo] = useState({})

  const [transactions, cards, clients] = useQueries({
    queries: [
      {
        queryKey: ['cards', cardId, 'statistics'],
        queryFn: () =>
          publicRequest.get(`/cards/${cardId}/statistics`).then((res) => {
            return res.data;
          }),
      },
      {
        queryKey: ['cards'],
        queryFn: () =>
          publicRequest.get(`/cards`).then((res) => {
            return res.data;
          }),
      },
      {
        queryKey: ['clients'],
        queryFn: () =>
          publicRequest.get(`/clients`).then((res) => {
            return res.data;
          }),
      }
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

  const creditColumn = [
    {
      title: "Summa",
      dataIndex: "amount",
      key: 'amount',
      width: 120,
      render: (text) => <p>{parseInt(text).toLocaleString("fr-fr")}</p>
    },
    {
      title: "Klient",
      key: "name",
      dataIndex: "client.name",
      width: 120,
      render: (_, record) => <p>{record.client.name}</p>,
    },
    {
      title: "Sana",
      key: "createdAt",
      width: 100,
      render: (_, record) => <p>{dateFormat(record.createdAt, 'dd-MM-yyyy hh:mm')}</p>,
    },
  ];

  const debitColumn = [
    {
      title: "Summa",
      dataIndex: "amount",
      key: 'amount',
      width: 120,
      render: (text) => <p>{parseInt(text).toLocaleString("fr-fr")}</p>
    },
    {
      title: "Sabab",
      key: "description",
      dataIndex: "expense.description",
      width: 160,
      render: (_, record) => <p>{record.expense.description}</p>,
    },
    {
      title: "Sana",
      key: "createdAt",
      width: 100,
      render: (_, record) => <p>{dateFormat(record.createdAt, 'dd-MM-yyyy hh:mm')}</p>,
    },
  ]

  const handleChange = (e) => {
    if (e.target.name === "amount") {
      const numericValue = e.target.value.replace(/\D/g, '');
      setInfo({
        ...info,
        payment: Number(numericValue)
      })
    } else if (e.target.name === "discount") {
      setType(e.target.value)
      setInfo({
        ...info,
        [e.target.name]: e.target.value,
      })
    } else {
      setInfo({
        ...info,
        [e.target.name]: e.target.value,
      })
    }
  }

  if (transactions.isLoading || clients.isLoading) return "Loading transactions or cliets..."
  if (cards.isLoading) return "Loading cards..."

  if (transactions.error)
    return 'An error has occurred: ' + transactions.error.message;

  if (cards.error)
    return 'An error has occurred: ' + transactions.error.message;

    const items = [
    {
      key: "credit",
      label: "To'lovlar",
      children: (
        <>
          <div>
            <Table
              dataSource={transactions?.data.creditTransactions}
              columns={creditColumn}
              pagination={false}
            />
          </div>
        </>
      )
    },
    {
      key: "debit",
      label: "Harajatlar",
      children: (
        <>
          <div>
            <Table
              dataSource={transactions?.data.debitTransactions}
              columns={debitColumn}
              pagination={false}
            />
          </div>
        </>
      )
    },
    {
      key: "newTransaction",
      label: "Yangi",
      children: (
        <div className='grid grid-cols-3 gap-4 bg-gray-100 p-2'>
          <div className='flex flex-col w-full gap-3'>
            <label className="text-lg font-semibold">Turi: </label>
            <Radio.Group onChange={handleChange} name="discount" defaultValue={'credit'} buttonStyle="solid">
              <Radio.Button value={'credit'}>To'lov</Radio.Button>
              <Radio.Button value={'debit'}>Harajat</Radio.Button>
            </Radio.Group>
          </div>
          {
            type === 'credit' ? (
              <>
                <div className='flex flex-col gap-3'>
                  <label className="text-lg font-semibold">Klientlar: </label>
                  <select className='p-2' onChange={handleChange} name="clientId">
                    {clients?.data.map((client) => (
                      <option key={client._id} value={client._id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className='flex flex-col gap-3'>
                  <label className="text-lg font-semibold">To'lov: </label>
                  <input className='p-2' placeholder={"To'lovni kiriting"} onChange={handleChange} name="amount" type={'number'} />
                </div>
              </>
            ) : type === "debit" ? (
              <>
                <div className='flex flex-col gap-3'>
                  <label className="text-lg font-semibold">Harajat turi: </label>
                  <select className='p-2' onChange={handleChange} name="clientId">
                    {clients?.data.map((client) => (
                      <option key={client._id} value={client._id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className='flex flex-col gap-3'>
                  <label className="text-lg font-semibold">Summa: </label>
                  <input className='p-2' placeholder={"To'lovni kiriting"} onChange={handleChange} name="amount" type={'number'} />
                </div>
              </>
            ) : <></>
          }
          <button
            className='bg-purple-100 text-purple-600 py-4 px-6 mb-10 rounded-xl duration-100 ease-in hover:bg-purple-100 hover:shadow-md'
            onClick={() => console.log(info)}
          // disabled={}
          >
            Saqlash
          </button>
        </div>
      )
    }
  ]

  return (
    <div>
      <div className="fixed bg-main-bg navbar w-full">
        <Navbar />
      </div>
      <div className='pt-20 px-8'>
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

export default Transactions