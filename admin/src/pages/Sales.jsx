import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Table } from 'antd'
import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { publicRequest, userRequest } from '../utils/requestMethods'

const Sales = () => {
  const location = useLocation()
  const path = location.pathname.split('/')[1]

  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))

  const { data, isLoading } = useQuery({
    queryKey: [path, date],
    queryFn: () =>
      publicRequest.get(`/${path}?date=${date}`).then((res) => {
        return res.data;
      }),
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
      dataIndex: 'price',
      key: 'price',
      width: 100,
    }
  ]

  // const expandedRowRender = (record) => {
  //   const columns = [
  //     {
  //       title: 'Rasmi',
  //       dataIndex: 'img',
  //       key: 'img',
  //       render: (_, record) => (
  //         <>
  //           <img src={record.img} width={24} height={24} />
  //         </>
  //       )
  //     },
  //     {
  //       title: 'Nomi',
  //       dataIndex: 'name',
  //       key: 'name',
  //     },
  //     {
  //       title: 'Ketdi',
  //       dataIndex: 'ketdi',
  //       key: 'ketdi'
  //     },
  //     {
  //       title: 'Narxi',
  //       dataIndex: 'price',
  //       key: 'price',
  //     }
  //   ]

  //   return <Table
  //     columns={columns}
  //     dataSource={record}
  //     pagination={false}
  //     scroll={{
  //       x: 500
  //     }}
  //   />;
  // }

  // const columns = [
  //   {
  //     title: 'Xaridor Ismi',
  //     dataIndex: 'clientName',
  //     key: 'clientName',
  //   },
  //   {
  //     title: "To'lov",
  //     dataIndex: 'payment',
  //     key: 'payment',
  //     render: (_, record) => <p>{record?.payment ? record.payment : 0}</p>,
  //   },
  //   {
  //     title: 'Number of Products',
  //     key: 'numberOfProducts',
  //     render: (record) => record?.products?.length,
  //   },
  //   {
  //     title: 'Status',
  //     dataIndex: 'status',
  //     key: 'status',
  //     render: (_, record) => (
  //       <p className={`px-3 py-2 w-fit rounded-lg ${record?.status === "Kutilmoqda" ? 'bg-yellow-50 text-yellow-500' : record.status === "Tasdiqlandi" ? 'bg-green-100 text-green-500' : 'bg-red-100 text-red-500'}`}>{record.status === null ? "Kutilmoqda" : record.status}</p>
  //     )
  //   },
  //   {
  //     title: 'Action',
  //     dataIndex: 'action',
  //     render: (_, record) => (
  //       <button
  //         onClick={() => handleDelete(record._id)}
  //         disabled={mutation.isLoading}
  //         className='cursor-pointer rounded-xl border-2 border-red-300 text-red-500 w-fit font-semibold px-3 py-2'>Delete</button>
  //     )
  //   }
  // ];

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
        <div>
          <label className='mr-6'>Boshlang'ich kunni tanlang: </label>
          <input type="date" name="date" className="bg-gray-100 p-2 rounded" value={date} onChange={event => setDate(event.target.value)} />
        </div>
        <div>
          <label className='mr-6'>Clientni tanlash: </label>
          <input type="date" name="date" className="bg-gray-100 p-2 rounded" value={date} onChange={event => setDate(event.target.value)} />
        </div>
        <div>SHotta yoki alohida clientti pagida klientti xaridlari haqida malumot bosin</div>

        {isLoading
          ? "Loading..."
          : (
            <>
              {
                data?.length === 0 ? (
                  <div className='text-3xl font-bold'>{date} dan bugunga qadar xaridlar mavjud emas</div>
                ) : data.map((sale) => (
                  <div key={sale.createdAtDate}>
                    <h1 className='mt-10'>{sale.createdAtDate}</h1>
                    {sale.sales.map((s) => (
                      <>
                        <div className='flex items-center gap-8 mt-4 text-xl font-semibold'>
                          <p className=''>{s.clientName}</p>
                          <p className=''>To'lov: <span>{s.payment}</span></p>
                        </div>
                        <Table
                          dataSource={s.products}
                          pagination={false}
                          columns={productColumns}
                        />
                      </>
                    ))}
                  </div>
                ))
                // ) : data.map((sale) => {
                //   const saleData = sale.sales.map((item, index) => ({
                //     key: index,
                //     ...item,
                //   }));
                //   return (
                //     <div key={sale.createdAtDate} className='flex flex-col gap-2 mb-5'>
                //       <div className='text-lg font-semibold'>
                //         Sana: <span className=''>{sale.createdAtDate}</span>
                //       </div>
                //       <div className='border-[1px] overflow-hidden'>
                //         <Table
                //           expandable={{
                //             expandedRowRender: (record) =>
                //               expandedRowRender(record?.products),
                //             defaultExpandedRowKeys: ['0'],
                //           }}
                //           dataSource={saleData}
                //           columns={columns}
                //           pagination={false}
                //           scroll={{
                //             x: 300
                //           }}
                //         />
                //       </div>
                //     </div>
                //   )
                // })
              }
            </>
          )
        }

      </div>
    </div>
  )
}

export default Sales