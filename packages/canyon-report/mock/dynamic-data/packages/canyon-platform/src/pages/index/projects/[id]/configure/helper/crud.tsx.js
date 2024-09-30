window["packages/canyon-platform/src/pages/index/projects/[id]/configure/helper/crud.tsx"] = {"content":"import { PlusOutlined } from \"@ant-design/icons\";\nimport { FC, useState } from \"react\";\n\n/**\n * noop is a helper function that does nothing\n * @returns undefined\n */\nfunction noop() {\n  /** no-op */\n}\n\n// 注意多默认值\n// noob函数\n\ninterface CrudTableProps {\n  dataSource: any[];\n  loading: boolean;\n  columns: any[];\n  formItems: any;\n  onCreate?: (values: any) => void;\n  onDelete?: (values: any) => void;\n  onUpdate?: (values: any) => void;\n  onSave?: () => void;\n}\n\nconst CrudTable: FC<CrudTableProps> = ({\n  dataSource,\n  loading,\n  columns,\n  formItems,\n  /* === */\n  onCreate = noop,\n  onDelete = noop,\n  onUpdate = noop,\n  onSave = noop,\n}) => {\n  const [visible, setVisible] = useState(false);\n  const [form] = Form.useForm();\n  function onFinish(values) {\n    if (values.mode === \"create\") {\n      if (values.userID && values.role) {\n        onCreate(values);\n      }\n    } else {\n      onUpdate(values);\n    }\n    setVisible(false);\n  }\n  function closeDrawer() {\n    setVisible(false);\n    // onFinish({ mode: 'create' });\n    form.submit();\n    setTimeout(() => {\n      form.resetFields();\n    }, 100);\n  }\n\n  function add() {\n    setVisible(true);\n    form.setFieldsValue({\n      mode: \"create\",\n      emails: [],\n    });\n  }\n\n  function edit(record) {\n    setVisible(true);\n    form.setFieldsValue({\n      ...record,\n      mode: \"update\",\n    });\n  }\n\n  return (\n    <div className={\"\"}>\n      <Table\n        bordered={true}\n        pagination={false}\n        size={\"small\"}\n        rowKey={\"id\"}\n        dataSource={dataSource}\n        columns={columns.concat({\n          title: \"操作\",\n          render: (text, record) => {\n            return (\n              <div>\n                <a\n                  onClick={() => {\n                    edit(record);\n                  }}\n                >\n                  编辑\n                </a>\n\n                <Divider type={\"vertical\"} />\n\n                <a className={\"text-red-500\"} onClick={() => onDelete(record)}>\n                  {\"删除\"}\n                </a>\n              </div>\n            );\n          },\n        })}\n        loading={loading}\n      />\n      <div className={\"h-2\"}></div>\n\n      <Space>\n        <Button type={\"primary\"} onClick={onSave}>\n          保存更改\n        </Button>\n        <Button onClick={add}>\n          <PlusOutlined />\n          添加\n        </Button>\n      </Space>\n      <Drawer\n        title={form.getFieldValue(\"mode\")}\n        open={visible}\n        width={\"45%\"}\n        onClose={closeDrawer}\n      >\n        <Form form={form} onFinish={onFinish} layout={\"vertical\"}>\n          <Form.Item label=\"mode\" name={\"mode\"} style={{ display: \"none\" }}>\n            <Input />\n          </Form.Item>\n          {formItems(form.getFieldValue(\"mode\"))}\n        </Form>\n      </Drawer>\n    </div>\n  );\n};\n\nexport default CrudTable;\n","coverage":{"name":"zt"}}