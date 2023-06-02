import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query'
import { Table } from 'antd'
import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { publicRequest, userRequest } from '../utils/requestMethods'

const Sales = () => {
  const location = useLocation()
  const path = location.pathname.split('/')[1]

  const [date, setDate] = useState('')
  const [clientId, setClientId] = useState(null)

  const [salesQuery, clientsQuery] = useQueries({
    queries: [
      {
        queryKey: [path, date, clientId],
        queryFn: () =>
          publicRequest.get(`/${path}?date=${date}&clientId=${clientId}`).then((res) => {
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

  function handleClientChange(e) {
    const selectedClient = clientsQuery.data.find((client) => {
      client.name === e.target.value
    });
    if (selectedClient) {
      setClientId(selectedClient._id);
    }
  }

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
          <img src={record.img} width={24} height={24} />
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

  if (clientsQuery.isLoading) return <p>Loading...</p>

  if (salesQuery.error) return <p>Serverda xatolik</p>

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
          <div className='basis-1/2'>
            <label className='mr-6'>Boshlang'ich kunni tanlang: </label>
            <input type="date" name="date" className="bg-gray-100 p-2 rounded" value={date} onChange={event => setDate(event.target.value)} />
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

        {salesQuery.isLoading
          ? "Loading..."
          : (
            <>
              {
                salesQuery.data?.length === 0 ? (
                  <div className='text-3xl font-bold'>{date} da xarid bo'lmagan</div>
                ) : salesQuery.data.map((sale) => (
                  <div key={sale.createdAtDate}>
                    <h1 className='mt-10'>{sale.createdAtDate}</h1>
                    {sale.sales.map((s) => (
                      <>
                        <div className='flex items-center gap-8 mt-4 text-xl font-semibold'>
                          <p className=''>{s.clientName}</p>
                          <p className=''>To'lov: <span>{parseInt(s?.payment).toLocaleString("fr-fr")}</span></p>
                          <p className=''>Summa: <span>{parseInt(s?.summa).toLocaleString("fr-fr")}</span></p>
                          <p className=''>Soni: <span>{parseInt(s?.sumSoni).toLocaleString("fr-fr")}</span></p>
                        </div>
                        <Table
                          dataSource={s.products.sort((a, b) => {
                            return b.ketdi - a.ketdi;
                          })}
                          pagination={false}
                          columns={productColumns}
                        />
                      </>
                    ))}
                  </div>
                ))
              }
            </>
          )
        }
      </div>
    </div>
  )
}

export default Sales