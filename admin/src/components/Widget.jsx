import { useEffect } from "react";
import { Link } from "react-router-dom"
import useDateStore from "../zustand/dateStore"

const Widget = ({ isLink, link, stats, icon, iconColor, title, isMoney, background, changeDateStored }) => {
  const { setUseStore } = useDateStore()

  useEffect(() => {
    if (changeDateStored) {
      setUseStore(true);
    }
  }, []);

  return (
    <>
      {isLink ? (
        <>
          <Link to={link} className="bg-white h-40 p-4 pt-9 rounded-2xl shadow-lg m-2 mr-6 flex justify-between">
            <div className="flex flex-col">
              <span className="text-lg font-bold">{title}</span>
              <span className="text-2xl font-light">
                {stats ? parseInt(stats).toLocaleString("fr-fr") : 0}  {isMoney ? "sum" : "ta"}
              </span>
            </div >
            <div className="flex items-end">
              <div className={`${background} p-2 rounded-md`}>
                <div style={{ color: iconColor }}>
                  {icon}
                </div>
              </div>
            </div>
          </Link>
        </>
      ) : (
        <div className="bg-white h-40 p-4 pt-9 rounded-2xl shadow-lg m-2 mr-6 flex justify-between">
          <div className="flex flex-col">
            <span className="text-lg font-bold">{title}</span>
            <span className="text-2xl font-light">
              {stats ? parseInt(stats).toLocaleString("fr-fr") : 0}  {isMoney ? "sum" : "ta"}
            </span>
          </div >
          <div className="flex items-end">
            <div className={`${background} p-2 rounded-md`}>
              <div style={{ color: iconColor }}>
                {icon}
              </div>
            </div>
          </div>
        </div >
      )}
    </>
  )
}

export default Widget