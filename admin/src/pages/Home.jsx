import React, { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'

import Navbar from '../components/Navbar'
import Widget from '../components/Widget'
import { publicRequest, userRequest } from '../utils/requestMethods'
import Exchange from '../components/charts/Exchange'
import usePermissionsStore from '../zustand/permissions'

import ReactLoading from "react-loading"
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import MonetizationOnOutlinedIcon from "@mui/icons-material/MonetizationOnOutlined";

const Home = () => {
  const { setPermissions } = usePermissionsStore()
  const { data: permissions, isLoading: permissionsLoading } = useQuery(
    {
      queryKey: ['permissions'],
      queryFn: () =>
        userRequest.get(`/permissions`).then((res) => {
          return res.data;
        }),
    },
  );

  useEffect(() => {
    if (!permissionsLoading) {
      setPermissions(permissions);
    }
  }, [permissionsLoading, permissions]);

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
        (isLoading || permissionsLoading) ? (
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
                <Widget
                  isLink={true}
                  link="/products"
                  stats={data?.productsCount}
                  title="Mahsulotlarning Soni"
                  isMoney={false}
                  background={"bg-red-200"}
                  icon={<ShoppingCartOutlinedIcon />}
                  iconColor={"crimson"}
                  changeDateStored={true}
                />
                <Widget
                  isLink={true}
                  stats={data?.monthlyEarnings}
                  link="/sales"
                  title="Oylik Savdo"
                  isMoney={true}
                  background={"bg-purple-100"}
                  icon={<AccountBalanceWalletOutlinedIcon />}
                  iconColor={"purple"}
                />
                <Widget
                  stats={data?.monthlyProfit}
                  title="Oylik To'lov"
                  isMoney={true}
                  background={"bg-green-200"}
                  icon={<PersonOutlinedIcon />}
                  iconColor={"green"}
                />
                {permissions.includes("can_see_stats") && (
                  <Widget
                    stats={data?.monthlySale}
                    title="Oylik Pul O'tkazmalar"
                    isMoney={true}
                    background={"bg-green-200"}
                    icon={<PersonOutlinedIcon />}
                    iconColor={"green"}
                  />
                )}
                <Widget
                  stats={data?.allExpensesCost}
                  title="Barcha Harajatlar"
                  isMoney={true}
                  background={"bg-purple-100"}
                  icon={<AccountBalanceWalletOutlinedIcon />}
                  iconColor={"purple"}
                />
                {permissions.includes("can_see_stats") && (
                  <Widget
                    stats={data?.monthlyExpensesCost}
                    title="Oylik Harajatlar"
                    isMoney={true}
                    background={"bg-yellow-100"}
                    icon={<AccountBalanceWalletOutlinedIcon />}
                    iconColor={"goldenrod"}
                  />
                )}
                {permissions.includes("can_see_stats") && (
                  <Widget
                    stats={data?.monthlyPayments}
                    title="Oylik Sof Foyda"
                    isMoney={true}
                    background={"bg-yellow-100"}
                    icon={<MonetizationOnOutlinedIcon />}
                    iconColor={"goldenrod"}
                  />
                )}
                {permissions.includes("can_see_stats") && (
                  <Widget
                    stats={data?.overallCost}
                    title="Mahsultolarning Tan Narxi"
                    isMoney={true}
                    background={"bg-yellow-100"}
                    icon={<MonetizationOnOutlinedIcon />}
                    iconColor={"goldenrod"}
                  />
                )}
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