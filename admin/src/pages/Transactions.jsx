import { useQueries } from '@tanstack/react-query';
import { Table, Tabs } from 'antd';
import React, { useEffect, useMemo, useState } from 'react'
import Navbar from '../components/Navbar'
import dateFormat from '../utils/functions';
import { publicRequest } from '../utils/requestMethods';

const Transactions = () => {
  const [filter, setFilter] = useState("credit")
  const [cardId, setCardId] = useState('64f7682d5e4645990d0393f9')

  const [cards] = useQueries({
    queries: [
      {
        queryKey: ['cards'],
        queryFn: () =>
          publicRequest.get(`/cards`).then((res) => {
            return res.data;
          }),
      }
    ],
  });

  const [transactions] = useQueries({
    queries: [
      {
        queryKey: ['cards', cardId, 'statistics'],
        queryFn: () =>
          publicRequest.get(`/cards/${cardId}/statistics`).then((res) => {
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


  if (transactions.isLoading) return "Loading transactions..."
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
        <>
          kartaga yangi tashalgan tolovni kiritish
        </>
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