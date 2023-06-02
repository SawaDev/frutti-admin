import { useLocation } from "react-router-dom"
import { useQueries } from '@tanstack/react-query'

import { publicRequest } from '../utils/requestMethods'
import Navbar from '../components/Navbar'
import { Table } from 'antd'
import { useState } from "react"

const SingleClient = () => {
  const location = useLocation();
  const id = location.pathname.split("/")[2];
  const [day, setDay] = useState("")

  const [clientQuery, clientSales] = useQueries({
    queries: [
      {
        queryKey: ['clients', id],
        queryFn: () =>
          publicRequest.get(`/clients/find/${id}`).then((res) => {
            return res.data;
          }),
      },
      {
        queryKey: ['sales', id, day],
        queryFn: () =>
          publicRequest.get(`/sales/${id}?day=${day}`).then((res) => res.data),
      },
    ],
  });

  if (clientQuery.isLoading) return 'Loading Client...';
  if (clientSales.isLoading) return 'Loading Sales of Client...';

  if (clientQuery.error)
    return 'An error has occurred: ' + clientQuery.error.message;

  if (clientSales.error)
    return 'An error has occurred: ' + clientSales.error.message;

  const expandedRowRender = (record) => {
    const columns = [
      {
        title: 'Rasmi',
        width: 100,
        dataIndex: 'img',
        key: 'img',
        render: (_, record) => (
          <>
            <img src={record.img} width={24} height={24} />
          </>
        )
      },
      {
        title: 'Nomi',
        width: 100,
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: 'Ketdi',
        width: 100,
        dataIndex: 'ketdi',
        key: 'ketdi'
      },
      {
        title: 'Narxi',
        width: 100,
        dataIndex: 'price',
        key: 'price',
      }
    ]

    return <Table
      columns={columns}
      dataSource={record.sort((a, b) => {
        return b.ketdi - a.ketdi;
      })}
      pagination={false} />;
  }

  const saleColumn = [
    {
      title: "To'lov",
      dataIndex: 'payment',
      key: 'payment',
      render: (_, record) => (
        <p>{record?.payment === null ? 0 : parseInt(record.payment).toLocaleString('fr-FR')}</p>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (_, record) => (
        <p className={`px-3 py-2 w-fit rounded-lg ${record?.status === "Kutilmoqda" ? 'bg-yellow-50 text-yellow-500' : record.status === "Tasdiqlandi" ? 'bg-green-100 text-green-500' : 'bg-red-100 text-red-500'}`}>{record.status === null ? "Kutilmoqda" : record.status}</p>
      )
    }
  ]

  return (
    <>
      <div className='flex relative'>
        <div className='w-full'>
          <div className="fixed bg-main-bg navbar w-full">
            <Navbar />
          </div>
          <div className="flex flex-col sm:flex-row gap-5 items-center justify-between mx-5 mb-4 mt-20 md:mt-24">
            <div className='flex items-center justify-between w-full shadow-lg px-5 py-3 rounded-xl'>
              <h1 className="mb-3 text-black text-xl font-medium capitalize">{clientQuery.data?.name}</h1>
              <div className="mb-2.5 text-md ">
                <span className="font-bold text-gray-400">Hisob: </span>
                <span className={`font-light ${clientQuery.data?.cash < 0 ? 'text-red-500' : 'text-green-500'}`}>{parseInt(clientQuery.data?.cash).toLocaleString('fr-FR')}</span>
              </div>
            </div>
          </div>
          <div className='mx-5 my-4 mt-10'>
            <label className='mr-6 font-semibold text-xl'>Kunni tanlang: </label>
            <input type="date" name="date" className="bg-gray-100 p-2 rounded" value={day} onChange={event => setDay(event.target.value)} />
          </div>
          <div className='flex flex-col gap-2 mb-5 mx-5'>
            {
              clientSales.data.length === 0 ? (
                <p>{day} da haridlar mavjud emas</p>
              ) : (
                clientSales.data.map((sale) => {
                  const saleData = sale.sales.map((item, index) => ({
                    key: index,
                    ...item,
                  }));
                  return (
                    <div key={sale._id}>
                      <div className='text-lg font-semibold'>
                        Sana: <span className=''>{sale?._id}</span>
                      </div>
                      <div className='border-[1px]'>
                        <Table
                          expandable={{
                            expandedRowRender: (record) =>
                              expandedRowRender(record?.products),
                            // defaultExpandedRowKeys: ['0'],
                            defaultExpandAllRows: true,
                          }}
                          columns={saleColumn}
                          dataSource={saleData.sort((a, b) => {
                            return a.createdAt - b.createdAt
                          })}
                          pagination={false}
                        />
                      </div>
                    </div>
                  );
                })
              )}
          </div>
        </div>
      </div>
    </>
  )
}

export default SingleClient