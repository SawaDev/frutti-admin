import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { useState } from "react";
import { Form, InputNumber, Input, Popconfirm, Table, Typography } from 'antd';
import { useNavigate, useLocation, Link } from 'react-router-dom';

import Navbar from "../components/Navbar"
import { publicRequest, userRequest } from "../utils/requestMethods"
import "./style.css"

const EditableCell = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  ...restProps
}) => {
  const inputNode = inputType === 'number' ? <InputNumber /> : <Input />;

  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{ margin: 0 }}
          rules={[
            {
              required: true,
              message: `Please Input ${title}!`,
            },
          ]}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

const rowSelection = {
  onChange: (selectedRowKeys, selectedRows) => {
    console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
  },
  getCheckboxProps: (record) => ({
    disabled: record.name === 'Disabled User',

    name: record.name,
  }),
};

const List = () => {
  const [form] = Form.useForm();
  const [editingKey, setEditingKey] = useState('');
  const isEditing = (record) => record._id === editingKey;

  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname.split("/")[1]

  const { data } = useQuery({
    queryKey: [path],
    queryFn: () =>
      publicRequest.get(`/${path}`).then((res) => {
        return res.data;
      }),
  });

  const edit = (record) => {
    form.setFieldsValue({
      name: '',
      soni: '',
      price: '',
      ...record,
    });
    setEditingKey(record._id);
  };

  const cancel = () => {
    setEditingKey('');
  };

  const saveP = async (id) => {
    try {
      const formData = await form.validateFields();

      await userRequest.put(`/${path}/${id}`, formData)

      window.location.reload();
    } catch (err) {
      alert(err)
    }
  }

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id) => {
      return userRequest.delete(`/${path}/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries([path])
    },
    onError: (err) => {
      alert(err?.response);
      console.log(err?.response);
    }
  })

  const handleDelete = (id) => {
    mutation.mutate(id)
  }

  const productsColumns = [
    {
      title: 'name',
      dataIndex: 'name',
      width: '20%',
      editable: true,
    },
    {
      title: 'soni',
      dataIndex: 'soni',
      width: '25%',
      // editable: true,
    },
    {
      title: 'price',
      dataIndex: 'price',
      width: '25%',
      editable: true,
    },
    {
      // title: 'operations',
      dataIndex: 'operations',
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <Typography.Link onClick={() => saveP(record._id)} style={{ marginRight: 8 }}>
              Save
            </Typography.Link>
            <Popconfirm title="Sure to cancel?" onConfirm={cancel}>
              <a>Cancel</a>
            </Popconfirm>
          </span>
        ) : (
          <div className='flex flex-wrap gap-2'>
            <Typography.Link disabled={editingKey !== ''} className="p-1 px-2 rounded-lg border-blue-400 border-[1px] " onClick={() => edit(record)}>
              Edit
            </Typography.Link>

            <Typography.Link disabled={editingKey !== ''} className="p-1 px-2 rounded-lg border-green-400 border-[1px] text-green-500" onClick={() => navigate(`/products/${record._id}`)}>
              View
            </Typography.Link>

            <Typography.Link disabled={editingKey !== '' || mutation.isLoading} className="p-1 px-2 rounded-lg border-red-400 border-[1px] text-red-500" onClick={() => handleDelete(record._id)}>
              Delete
            </Typography.Link>
          </div>
        );
      },
    },
  ];

  const clientsColumns = [
    {
      title: 'Ism',
      dataIndex: 'name',
      width: 120,
      editable: true,
      fixed: 'left',
    },
    {
      title: 'Hisob',
      dataIndex: 'cash',
      width: 160,
      render: (_, record) => {
        const status = record.cash
        return (
          <div className={status < 0 ? 'bg-red-100 text-red-500 py-1 px-3 rounded-md text-center' : 'bg-green-100 text-green-500 py-1 px-3 rounded-md text-center'}>
            <span>
              {parseInt(record.cash).toLocaleString("fr-fr")}
            </span>
          </div>
        )
      }
    },
    {
      title: 'Haridlar',
      dataIndex: 'sales',
      width: 100,
      render: (_, record) => {
        const count = record.sales.length
        return (
          <div className="">
            <span>
              {count}
            </span>
          </div>
        )
      }
    },
    {
      title: 'operations',
      dataIndex: 'operations',
      width: 250,
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <span className='flex flex-col sm:flex-row'>
            <Typography.Link onClick={() => saveP(record._id)} style={{ marginRight: 8 }}>
              Save
            </Typography.Link>
            <Popconfirm title="Sure to cancel?" onConfirm={cancel}>
              <a>Cancel</a>
            </Popconfirm>
          </span>
        ) : (
          <div className='flex flex-wrap gap-2'>
            <Typography.Link disabled={editingKey !== ''} className="p-1 px-2 rounded-lg border-blue-400 border-[1px]" onClick={() => edit(record)}>
              Edit
            </Typography.Link>

            <Typography.Link disabled={editingKey !== ''} className="p-1 px-2 rounded-lg border-green-400 border-[1px] text-green-500" onClick={() => navigate(`/${path}/${record._id}`)}>
              View
            </Typography.Link>

            <Typography.Link disabled={editingKey !== '' || mutation.isLoading} className="p-1 px-2 rounded-lg border-red-400 border-[1px] text-red-500" onClick={() => handleDelete(record._id)}>
              Delete
            </Typography.Link>
          </div>
        );
      },
    },
  ];

  const mergedProductsColumns = productsColumns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        inputType: col.dataIndex === 'age' ? 'number' : 'text',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  const mergedClientsColumns = clientsColumns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        inputType: col.dataIndex === 'age' ? 'number' : 'text',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  return (
    <div className="">
      <div className="fixed bg-main-bg navbar w-full">
        <Navbar />
      </div>
      <div className="pt-[100px] px-4">
        <div className='pb-3 flex justify-between'>
          <p className='font-semibold text-2xl capitalize'>
            {path}
          </p>
          <Link to={`/${path}/new`}>
            <div className='py-2 px-4 border-2 border-blue-500 text-blue-500 rounded-2xl'>Yangi</div>
          </Link>
        </div>
        <div className="">
          <Form form={form} component={false}>
            <Table
              components={{
                body: {
                  cell: EditableCell,
                },
              }}
              bordered
              dataSource={data}
              columns={path === "clients" ? mergedClientsColumns : mergedProductsColumns}
              rowClassName="editable-row"
              pagination={false}
              scroll={{
                x: 400
              }}
            />
          </Form>
        </div>
      </div>
    </div>
  )
}

export default List