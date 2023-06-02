import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

import Navbar from '../components/Navbar'
import Widget from '../components/Widget'
import { publicRequest } from '../utils/requestMethods'
import getCurrentUser from '../utils/getCurrentUser'
import Exchange from '../components/charts/Exchange'

const Home = () => {
  const stats = {
    productsCount: 0,
    overallCost: 0,
    monthlyEarnings: 0,
    monthlySale: 0
  }

  const { isLoading, data } = useQuery({
    queryKey: ["stats"],
    queryFn: () =>
      publicRequest.get("/products/stats").then((res) => {
        return res.data === null ? stats : res.data;
      }),
  });

  return (
    <>
      {
        isLoading ? "Loading.." : (
          <div className="flex relative">
            <div className="bg-main-bg min-h-screen w-full">
              <div className="fixed z-1 bg-main-bg navbar w-full">
                <Navbar />
              </div>
              <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-1 mt-20">
                <div>
                  <Widget type="warehouse" stats={data?.productsCount} />
                </div>
                <div>
                  <Widget type="money_in_warehouse" stats={data?.overallCost} />
                </div>
                <div>
                  <Widget type="profit" stats={data?.monthlyProfit} />
                </div>
                <div className="align-self-center">
                  <Widget type="sale" stats={data?.monthlySale} />
                </div>
                <div>
                  <Widget type="earning" stats={data?.monthlyEarnings} />
                </div>
              </div>
              {/* <div className='relative'>
                <div className='absolute top-0 -left-10 sm:left-0 w-full'> */}

              <Exchange />
              {/* </div>
              </div> */}
              {/* <div action="" className="addForm mt-10 bg-green-100 p-2 flex gap-2">
          <input onChange={handleChange} type="text" id="name" placeholder="name" />
          <input onChange={handleChange} type="number" id="price" placeholder="price" />
          <input onChange={handleChange} type="number" id="soni" placeholder="soni" />
          <button disabled={createPostMutation.isLoading} onClick={handleSubmit}>{createPostMutation.isLoading ? "Loading..." : "Create"}</button>
        </div> */}
            </div>
          </div>
        )
      }
    </>
  )
}

export default Home