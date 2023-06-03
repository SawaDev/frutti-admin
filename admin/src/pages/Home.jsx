import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

import Navbar from '../components/Navbar'
import Widget from '../components/Widget'
import { publicRequest } from '../utils/requestMethods'
import getCurrentUser from '../utils/getCurrentUser'
import Exchange from '../components/charts/Exchange'
import ReactLoading from "react-loading"

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
        isLoading ? (
          <div className='text-purple-500 h-screen w-full grid place-items-center'>
            <ReactLoading type="spinningBubbles" color="rgb(168 85 247)" />
          </div>
        ) : (
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
              <Exchange /> 
            </div>
          </div>
        )
      }
    </>
  )
}

export default Home