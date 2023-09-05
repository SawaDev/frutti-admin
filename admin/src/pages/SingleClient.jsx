import { useLocation } from "react-router-dom"
import { useQueries } from '@tanstack/react-query'
import { Table } from 'antd'
import { useEffect, useState } from "react"

import { publicRequest } from '../utils/requestMethods'
import Navbar from '../components/Navbar'
import { expandedRowColumns, saleColumn } from "../tableColumns"
import EChartsDynamic from "../components/charts/BarchartEcharts"

const SingleClient = () => {
  const location = useLocation();
  const id = location.pathname.split("/")[2];
  const [startDay, setStartDay] = useState("")
  const [endDay, setEndDay] = useState("")

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
    setEndDay(endFullDate)

    const startMonth = date.getMonth().toString().padStart(2, '0');
    const startFullDate = `${startMonth === '00' ? year - 1 : year}-${startMonth === '00' ? '12' : startMonth}-${day}`

    setStartDay(startFullDate)
  }, [])

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
        queryKey: ['sales', id, startDay, endDay],
        queryFn: () =>
          publicRequest.get(`/sales/${id}?startDay=${startDay}&endDay=${endDay}`).then((res) => res.data),
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

    return <Table
      columns={expandedRowColumns}
      dataSource={record.sort((a, b) => {
        return b.ketdi - a.ketdi;
      })}
      pagination={false} />;
  }

  const xAxisData = clientSales?.data?.data.map((d) => d._id)
  const yAxisData = ['Summa', "To'lov", "Soni"];
  const legendData = ['Summa', "To'lov", "Soni"];

  const getPropertyData = (propertyNames) => {
    return propertyNames.map(propertyName =>
      clientSales?.data?.data.map((d) => d[propertyName])
    );
  };
  const seriesData = getPropertyData(['summa', 'payment', 'sumKetdi'])

  return (
    <>
      <div className='flex relative'>
        <div className='w-full'>
          <div className="fixed bg-main-bg navbar w-full">
            <Navbar />
          </div>
          <div className="flex flex-col sm:flex-row gap-5 items-center justify-between mx-5 mb-4 mt-20 md:mt-24">
            <div className="grid lg:grid-cols-3 grid-rows-2 lg:grid-rows-1 h-fit w-full gap-8 px-3 mb-4 mt-20 md:mt-24">
              <div className="shadow-lg col-span-1 p-5 relative">
                <div className="text-purple-600 font-bold absolute t-0 l-0 p-1 pr-4 bg-purple-200 rounded rounded-br-2xl ">Info</div>
                <h1 className="text-center py-4 text-lg text-gray-600">Info</h1>
                <div className="flex flex-col gap-5 items-center text-center md:flex-row md:justify-around md:text-left">
                  <div>
                    <h1 className="mb-3 text-gray-500 text-lg capitalize">{clientQuery.data?.name}</h1>
                    <div className="mb-2.5 text-md">
                      <span className="font-bold text-gray-400">Hisob: </span>
                      <span className={`font-light ${clientQuery.data?.cash < 0 ? 'text-red-500' : 'text-green-500'}`}>{parseInt(clientQuery.data?.cash).toLocaleString('fr-FR')}</span>
                    </div>
                    <div className="mb-2.5 text-md">
                      <span className="font-bold text-gray-400">Umumiy to'lov: </span>
                      <span className="font-light">{parseInt(clientSales.data?.totalPayment).toLocaleString('fr-fr')}</span>
                    </div>
                    <div className="mb-2.5 text-md">
                      <span className="font-bold text-gray-400">Umumiy soni: </span>
                      <span className="font-light">{parseInt(clientSales.data?.totalKetdi).toLocaleString('fr-fr')}</span>
                    </div>
                    <div className="mb-2.5 text-md">
                      <span className="font-bold text-gray-400">Umumiy summa: </span>
                      <span className="font-light">{parseInt(clientSales.data?.totalSumma).toLocaleString('fr-fr')}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="shadow-lg col-span-2 w-full">
                <EChartsDynamic
                  title="Klient"
                  xAxisData={xAxisData}
                  yAxisData={yAxisData}
                  legendData={legendData}
                  seriesData={seriesData}
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-8">
            <div className='mx-5 my-4 mt-10'>
              <label className='mr-6 font-semibold text-xl'>Boshlang'ich kunni tanlang: </label>
              <input type="date" name="date" className="bg-gray-100 p-2 rounded" value={startDay} onChange={event => setStartDay(event.target.value)} />
            </div>
            <div className='mx-5 my-4 mt-10'>
              <label className='mr-6 font-semibold text-xl'>Ohirgi kunni tanlang: </label>
              <input type="date" name="date" className="bg-gray-100 p-2 rounded" value={endDay} onChange={event => setEndDay(event.target.value)} />
            </div>
          </div>
          <div className='flex flex-col gap-2 mb-5 mx-5'>
            {
              clientSales.data.length === 0 ? (
                <p>{startDay} da haridlar mavjud emas</p>
              ) : (
                clientSales.data.data.map((sale) => {
                  const saleData = sale.sales.map((item, index) => ({
                    key: index,
                    ...item,
                  }));
                  return (
                    <div key={sale?._id} className='pb-3'>
                      <div className='flex gap-2 text-lg mb-2'>
                        <p className="font-semibold">Sana:</p> <span className=''>{sale?._id}</span>
                      </div>
                      <div className='flex items-center gap-10 text-[14px] mb-2'>
                        <p className=''>To'lov: <span className='font-semibold'>{parseInt(sale?.payment).toLocaleString("fr-fr")}</span></p>
                        <p className=''>Soni: <span className='font-semibold'>{parseInt(sale?.sumKetdi).toLocaleString("fr-fr")}</span></p>
                        <p className=''>Summa: <span className='font-semibold'>{parseInt(sale?.summa).toLocaleString("fr-fr")}</span></p>
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