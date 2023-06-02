import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import MonetizationOnOutlinedIcon from "@mui/icons-material/MonetizationOnOutlined";

const Widget = ({ type, stats }) => {
  let data;

  switch (type) {
    case "warehouse":
      data = {
        title: "Mahsulotlarning Soni",
        isMoney: false,
        link: "See all users",
        amount: stats,
        icon: (
          <div className="flex items-end">
            <div className="bg-red-200 p-2 rounded-md">
              <ShoppingCartOutlinedIcon
                style={{
                  color: "crimson",
                }}
              />
            </div>
          </div>
        ),
      };
      break;
    case "money_in_warehouse":
      data = {
        title: "Mahsultolarning Tan Narxi",
        isMoney: true,
        link: "View all orders",
        amount: stats,
        icon: (
          <div className="flex items-end">
            <div className="bg-yellow-100 p-2 rounded-md">
              <MonetizationOnOutlinedIcon
                style={{
                  color: "goldenrod",
                }}
              />
            </div>
          </div>
        ),
      };
      break;
    case "earning":
      data = {
        title: "Oylik To'lov",
        isMoney: true,
        link: "View net earnings",
        amount: stats,
        icon: (
          <div className="flex items-end">
            <div className="bg-green-200 p-2 rounded-md">
              <PersonOutlinedIcon
                style={{
                  // backgroundColor: "rgba(0, 128, 0, 0.2)",
                  color: "green"
                }}
              />
            </div>
          </div>
        ),
      };
      break;
    case "sale":
      data = {
        title: "Oylik Savdo",
        isMoney: true,
        amount: stats,
        link: "See details",
        icon: (
          <div className="flex items-end">
            <div className="bg-purple-200 p-2 rounded-md">
              <AccountBalanceWalletOutlinedIcon
                style={{
                  color: "purple",
                }}
              />
            </div>
          </div>
        ),
      };
      break;
    case "profit":
      data = {
        title: "Oylik Sof Foyda",
        isMoney: true,
        amount: stats,
        link: "See details",
        icon: (
          <div className="flex items-end">
            <div className="bg-purple-200 p-2 rounded-md">
              <AccountBalanceWalletOutlinedIcon
                style={{
                  color: "purple",
                }}
              />
            </div>
          </div>
        ),
      };
      break;
    default:
      break;
  }

  return (
    <div className="bg-white h-40 p-4 pt-9 rounded-2xl shadow-lg m-2 mr-6 flex justify-between">
      <div className="flex flex-col">
        <span className="text-lg font-bold">{data.title}</span>
        <span className="text-2xl font-light">
          {data?.amount ? parseInt(data?.amount).toLocaleString("fr-fr") : 0}  {data.isMoney ? "sum" : "ta"}
        </span>
      </div>
      {data.icon}
    </div>
  )
}

export default Widget