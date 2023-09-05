import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';

export const saleColumn = [
  {
    title: "To'lov",
    dataIndex: 'payment',
    key: 'payment',
    render: (_, record) => (
      <p>{record?.payment === null ? 0 : parseInt(record.payment).toLocaleString('fr-FR')}</p>
    )
  },
  {
    title: "Soni",
    dataIndex: 'sumKetdi',
    key: "sumKetdi",
    render: (_, record) => (
      <p>{parseInt(record.sumKetdi).toLocaleString('fr-FR')}</p>
    )
  },
  {
    title: "Umumiy Soni",
    dataIndex: 'summa',
    key: "summa",
    render: (_, record) => (
      <p>{parseInt(record.summa).toLocaleString('fr-FR')}</p>
    )
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: (_, record) => (
      <p className={`px-3 py-2 w-fit rounded-lg ${record?.status === "Kutilmoqda" ? 'bg-yellow-100 text-yellow-500' : record.status === "Tasdiqlandi" ? 'bg-green-100 text-green-500' : 'bg-red-100 text-red-500'}`}>{record.status === null ? "Kutilmoqda" : record.status}</p>
    )
  },
  {
    title: 'Skidka',
    dataIndex: 'discount',
    key: 'discount',
    render: (_, record) => (
      <div>{record.discount === true ? (
        <div className="w-fit flex items-center bg-green-100 text-green-500 px-2 py-1 rounded-lg">
          <div><CheckIcon /></div>
          <div>Skidka</div>
        </div>
      ) : (
        <div className="w-fit flex items-center bg-red-100 text-red-500 px-2 py-1 rounded-lg">
          <div><ClearIcon /></div>
          <div>Skidka emas</div>
        </div>
      )}</div>
    )
  },
  {
    title: 'Hisob (oldin)',
    dataIndex: 'cashBefore',
    key: 'cashBefore',
    render: (_, record) => (
      <div>{
        record.cashBefore >= 0 ? (
          <span className="text-[16px] text-green-500">
            {parseInt(record.cashBefore).toLocaleString('fr-fr')}
          </span>
        ) : (
          <span className="text-[16px] text-red-500">
            {parseInt(record.cashBefore).toLocaleString('fr-fr')}
          </span>
        )
      }</div>
    )
  },
  {
    title: 'Hisob (keyin)',
    dataIndex: 'cashAfter',
    key: 'cashAfter',
    render: (_, record) => (
      <div>{
        record.cashAfter >= 0 ? (
          <span className="text-[16px] text-green-500">
            {parseInt(record.cashAfter).toLocaleString('fr-fr')}
          </span>
        ) : (
          <span className="text-[16px] text-red-500">
            {parseInt(record.cashAfter).toLocaleString('fr-fr')}
          </span>
        )
      }</div>
    )
  },
]

export const expandedRowColumns = [
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