window["packages/canyon-platform/src/pages/index/projects/[id]/index.tsx"] = {"content":"import Icon, {\n  AimOutlined,\n  BranchesOutlined,\n  EditOutlined,\n  QuestionCircleOutlined,\n} from \"@ant-design/icons\";\nimport { useMutation, useQuery } from \"@apollo/client\";\nimport { TourProps } from \"antd\";\nimport { ColumnsType } from \"antd/es/table\";\nimport dayjs from \"dayjs\";\nimport ReactECharts from \"echarts-for-react\";\nimport { useEffect, useRef, useState } from \"react\";\nimport { useTranslation } from \"react-i18next\";\nimport { Link, useNavigate, useParams } from \"react-router-dom\";\n\nimport ProjectRecordDetailDrawer from \"../../../../components/app/ProjectRecordDetailDrawer.tsx\";\nimport MaterialSymbolsCommitSharp from \"../../../../components/icons/MaterialSymbolsCommitSharp.tsx\";\nimport {\n  DeleteProjectRecordDocument,\n  GetProjectByIdDocument,\n  GetProjectChartDataDocument,\n  GetProjectCompartmentDataDocument,\n  GetProjectRecordsDocument,\n  ProjectRecordsModel,\n} from \"../../../../helpers/backend/gen/graphql.ts\";\n\nconst { useToken } = theme;\nconst { Title, Text } = Typography;\n// const content = ()=>{\n//   return <div>\n//     nihao\n//   </div>\n// }\nconst ProjectOverviewPage = () => {\n  const { token } = useToken();\n  const { t } = useTranslation();\n  const [keyword, setKeyword] = useState(\"\");\n  const [current, setCurrent] = useState(1);\n  const [pageSize, setPageSize] = useState(10);\n  const [open, setOpen] = useState(false);\n  const [sha, setSha] = useState(\"\");\n  const initDefaultBranchOnly = Boolean(\n    localStorage.getItem(\"defaultBranchOnly\"),\n  );\n  const [defaultBranchOnly, setDefaultBranchOnly] = useState(\n    initDefaultBranchOnly,\n  );\n  const onClose = () => {\n    setOpen(false);\n  };\n\n  const pam = useParams();\n\n  const { data: projectsData, loading } = useQuery(GetProjectRecordsDocument, {\n    variables: {\n      projectID: pam.id as string,\n      current: current,\n      pageSize: pageSize,\n      keyword: keyword,\n      onlyDefault: defaultBranchOnly,\n    },\n    fetchPolicy: \"no-cache\",\n  });\n\n  const { data: projectByIdData } = useQuery(GetProjectByIdDocument, {\n    variables: {\n      projectID: pam.id as string,\n    },\n    fetchPolicy: \"no-cache\",\n  });\n\n  const { data: projectChartData, loading: projectChartDataLoading } = useQuery(\n    GetProjectChartDataDocument,\n    {\n      variables: {\n        projectID: pam.id as string,\n        branch: \"-\",\n      },\n      fetchPolicy: \"no-cache\",\n    },\n  );\n\n  const {\n    data: projectCompartmentDataData,\n    loading: projectCompartmentDataLoading,\n  } = useQuery(GetProjectCompartmentDataDocument, {\n    variables: {\n      projectID: pam.id as string,\n    },\n    fetchPolicy: \"no-cache\",\n  });\n  const [deleteProjectRecord] = useMutation(DeleteProjectRecordDocument);\n  const ref1 = useRef(null);\n  const ref2 = useRef(null);\n  const [tourOpen, setTourOpen] = useState(false);\n  const steps: TourProps[\"steps\"] = [\n    {\n      title: t(\"projects.statements_tour_title\"),\n      description: t(\"projects.statements_tour_description\"),\n      target: () => ref1.current,\n    },\n    {\n      title: t(\"projects.newlines_tour_title\"),\n      description: t(\"projects.newlines_tour_description\"),\n      target: () => ref2.current,\n    },\n  ];\n\n  useEffect(() => {\n    if (!localStorage.getItem(\"touropen\")) {\n      setTimeout(() => {\n        setTourOpen(true);\n        localStorage.setItem(\"touropen\", \"true\");\n      }, 2000);\n    }\n  }, []);\n\n  const columns: ColumnsType<ProjectRecordsModel> = [\n    {\n      title: (\n        <div>\n          <Icon component={MaterialSymbolsCommitSharp} className={\"mr-1\"} />\n          Sha\n        </div>\n      ),\n      dataIndex: \"sha\",\n      width: \"100px\",\n      render(_, { webUrl }): JSX.Element {\n        return (\n          <a href={webUrl} target={\"_blank\"} rel=\"noreferrer\">\n            {_?.slice(0, 7)}\n          </a>\n        );\n      },\n    },\n    {\n      title: (\n        <>\n          <BranchesOutlined className={\"mr-1\"} />\n          {t(\"projects.branch\")}\n        </>\n      ),\n      dataIndex: \"branch\",\n      ellipsis: true,\n      width: \"120px\",\n    },\n    {\n      title: (\n        <>\n          <AimOutlined className={\"mr-1\"} />\n          {t(\"projects.compare_target\")}\n        </>\n      ),\n      dataIndex: \"compareTarget\",\n      width: \"120px\",\n      render(_, { compareUrl }): JSX.Element {\n        return (\n          <a href={compareUrl} target={\"_blank\"} rel=\"noreferrer\">\n            {_.length === 40 ? _.slice(0, 7) : _}\n          </a>\n        );\n      },\n    },\n    {\n      title: <>{t(\"Build\")}</>,\n      align: \"center\",\n      width: \"70px\",\n      render(_, record) {\n        return (\n          <>\n            {record.buildID !== \"-\" ? (\n              <a href={record.buildURL} target={\"_blank\"} rel=\"noreferrer\">\n                <img\n                  className={\"w-[16px]\"}\n                  src={`/gitproviders/${record.buildProvider === \"-\" ? \"gitlab\" : record.buildProvider}.svg`}\n                  alt=\"\"\n                />\n              </a>\n            ) : (\n              <span>-</span>\n            )}\n          </>\n        );\n      },\n    },\n    {\n      title: t(\"projects.message\"),\n      dataIndex: \"message\",\n      width: \"160px\",\n      ellipsis: true,\n    },\n    {\n      title: (\n        <div ref={ref1}>\n          <Tooltip title={t(\"projects.statements_tooltip\")} className={\"mr-2\"}>\n            <QuestionCircleOutlined />\n          </Tooltip>\n          {t(\"projects.statements\")}\n        </div>\n      ),\n      dataIndex: \"statements\",\n      // width: '148px',\n      render(_, { sha }) {\n        return (\n          <Link\n            to={{\n              pathname: `/projects/${pam.id}/commits/${sha}`,\n            }}\n          >\n            {_}%\n          </Link>\n        );\n      },\n      // width: '150px',\n      // render(_, { sha }) {\n      //   return (\n      //     <div className={'flex'}>\n      //       <Link\n      //         // style={{border:'1px solid #000'}}\n      //         className={'block w-[60px]'}\n      //         to={{\n      //           pathname: `/projects/${pam.id}/commits/${sha}`,\n      //         }}\n      //       >\n      //         {_}%\n      //       </Link>\n      //       <Popover content={content} title=\"Title\">\n      //         <img src={im} alt='coverage'/>\n      //       </Popover>\n      //\n      //     </div>\n      //   );\n      // },\n    },\n    {\n      title: (\n        <div ref={ref2}>\n          <Tooltip title={t(\"projects.newlines_tooltip\")} className={\"mr-2\"}>\n            <QuestionCircleOutlined />\n          </Tooltip>\n          {t(\"projects.newlines\")}\n        </div>\n      ),\n      dataIndex: \"newlines\",\n      // width: '130px',\n      render(_, { sha }) {\n        return (\n          <Link\n            to={{\n              pathname: `/projects/${pam.id}/commits/${sha}`,\n            }}\n          >\n            {_}%\n          </Link>\n        );\n      },\n    },\n    {\n      title: t(\"projects.report_times\"),\n      dataIndex: \"times\",\n      width: \"80px\",\n    },\n    {\n      title: t(\"projects.latest_report_time\"),\n      dataIndex: \"lastReportTime\",\n      width: \"135px\",\n      render(_) {\n        return <span>{dayjs(_).format(\"MM-DD HH:mm\")}</span>;\n      },\n    },\n    {\n      title: t(\"common.option\"),\n      width: \"125px\",\n      render(_): JSX.Element {\n        return (\n          <div>\n            <a\n              onClick={() => {\n                setOpen(true);\n                setSha(_.sha);\n              }}\n            >\n              {t(\"projects.reported_details\")}\n            </a>\n            <Divider type={\"vertical\"} />\n\n            <Popconfirm\n              title=\"Delete the project record\"\n              description=\"Are you sure to delete this project record?\"\n              onConfirm={() => {\n                deleteProjectRecord({\n                  variables: {\n                    projectID: pam.id as string,\n                    sha: _.sha,\n                  },\n                })\n                  .then(() => {\n                    window.location.reload();\n                  })\n                  .catch((err) => {\n                    console.log(err);\n                  });\n              }}\n              onCancel={() => {\n                console.log(\"cancel\");\n              }}\n              okText=\"Yes\"\n              cancelText=\"No\"\n            >\n              <a className={\"text-red-500 hover:text-red-600\"}>\n                {t(\"common.delete\")}\n              </a>\n            </Popconfirm>\n          </div>\n        );\n      },\n    },\n  ];\n\n  const option = {\n    backgroundColor: \"transparent\",\n    grid: {\n      top: \"30px\",\n      left: \"30px\",\n      right: \"10px\",\n      bottom: \"20px\",\n    },\n    tooltip: {\n      trigger: \"axis\",\n    },\n    legend: {\n      x: \"right\",\n      data: [t(\"projects.statements\"), t(\"projects.newlines\")],\n    },\n    xAxis: {\n      type: \"category\",\n      data:\n        projectChartData?.getProjectChartData.map(({ sha }) =>\n          sha.slice(0, 7),\n        ) || [],\n    },\n    yAxis: {\n      type: \"value\",\n    },\n    series: [t(\"projects.statements\"), t(\"projects.newlines\")].map(\n      (_, index) => ({\n        name: _,\n        data:\n          projectChartData?.getProjectChartData.map(\n            ({ statements, newlines }) => (index === 0 ? statements : newlines),\n          ) || [],\n        type: \"line\",\n      }),\n    ),\n  };\n  const nav = useNavigate();\n  return (\n    <div className={\"\"}>\n      <div className={\"mb-10\"}>\n        <div className={\"flex\"}>\n          <Title level={2}>\n            {projectByIdData?.getProjectByID.pathWithNamespace}\n            <EditOutlined\n              className={\"ml-3 cursor-pointer text-[#0071c2]\"}\n              style={{ fontSize: \"20px\" }}\n              onClick={() => {\n                nav(`/projects/${pam.id}/configure`);\n              }}\n            />\n          </Title>\n        </div>\n\n        <div>\n          <Text type={\"secondary\"}>\n            {t(\"projects.config.project.id\")}:{\" \"}\n            {projectByIdData?.getProjectByID.id}\n          </Text>\n          <Text className={\"ml-6\"} type={\"secondary\"}>\n            {t(\"projects.default.branch\")}:{\" \"}\n            {projectByIdData?.getProjectByID.defaultBranch}\n          </Text>\n        </div>\n        {(projectByIdData?.getProjectByID.tags || []).length > 0 && (\n          <div className={\"pt-5\"}>\n            <Text className={\"mr-3\"} type={\"secondary\"}>\n              {t(\"projects.config.tag\")}:\n            </Text>\n            {projectByIdData?.getProjectByID.tags.map(\n              ({ color, name, link }, index) => (\n                <Tag\n                  style={{ cursor: link ? \"pointer\" : \"default\" }}\n                  key={index}\n                  color={color}\n                  onClick={() => {\n                    if (link) {\n                      window.open(link);\n                    }\n                  }}\n                >\n                  {name}\n                </Tag>\n              ),\n            )}\n          </div>\n        )}\n      </div>\n\n      <Text className={\"block mb-3\"} style={{ fontWeight: 500, fontSize: 16 }}>\n        {t(\"projects.overview\")}\n      </Text>\n      <Tour\n        open={tourOpen}\n        onClose={() => {\n          setTourOpen(false);\n        }}\n        steps={steps}\n      />\n      <div className={\"flex mb-10\"}>\n        <Spin spinning={projectCompartmentDataLoading}>\n          <div\n            className={`[list-style:none] grid grid-cols-[repeat(2,_215px)] grid-rows-[repeat(2,_1fr)] gap-[16px] h-full mr-[16px]`}\n          >\n            {(projectCompartmentDataData?.getProjectCompartmentData || []).map(\n              (item, index) => {\n                return (\n                  <div\n                    className={\n                      \"p-[20px] h-[150px] flex justify-between flex-col bg-white dark:bg-[#0C0D0E]\"\n                    }\n                    style={{\n                      border: `1px solid ${token.colorBorder}`,\n                      borderRadius: `${token.borderRadius}px`,\n                    }}\n                    key={index}\n                  >\n                    <Text type={\"secondary\"}>{t(item.label)}</Text>\n                    <Text className={\"text-xl\"}>{item.value}</Text>\n                  </div>\n                );\n              },\n            )}\n          </div>\n        </Spin>\n\n        <div style={{ flex: 1 }}>\n          <Spin spinning={projectChartDataLoading}>\n            <div\n              className={\"p-[18px] bg-white dark:bg-[#0C0D0E]\"}\n              style={{\n                border: `1px solid ${token.colorBorder}`,\n                borderRadius: `${token.borderRadius}px`,\n              }}\n            >\n              <div className={\"flex items-center\"}>\n                <Title level={5} style={{ marginBottom: \"0\" }}>\n                  {t(\"projects.trends_in_coverage\")}\n                </Title>\n                <Text\n                  type={\"secondary\"}\n                  className={\"ml-2\"}\n                  style={{ fontSize: 12 }}\n                >\n                  {t(\"projects.trends.tooltip\")}\n                </Text>\n              </div>\n              <ReactECharts\n                theme={\n                  localStorage.getItem(\"theme\") === \"dark\"\n                    ? \"dark\"\n                    : {\n                        color: [\"#287DFA\", \"#FFB400\"],\n                      }\n                }\n                style={{ height: \"254px\" }}\n                option={option}\n              />\n            </div>\n          </Spin>\n        </div>\n      </div>\n\n      <Text className={\"block mb-3\"} style={{ fontWeight: 500, fontSize: 16 }}>\n        {t(\"projects.records\")}\n      </Text>\n      <div\n        className={\"flex\"}\n        style={{ marginBottom: \"16px\", justifyContent: \"space-between\" }}\n      >\n        <div className={\"flex items-center gap-5\"}>\n          <Input.Search\n            defaultValue={keyword}\n            placeholder={t(\"projects.overview_search_keywords\")}\n            onSearch={(value) => {\n              setKeyword(value);\n              setCurrent(1);\n            }}\n            style={{ width: \"600px\" }}\n          />\n          <Space>\n            <Text type={\"secondary\"}>\n              {t(\"projects.only.default.branch\")}:{\" \"}\n            </Text>\n            <Switch\n              defaultChecked={Boolean(\n                localStorage.getItem(\"defaultBranchOnly\"),\n              )}\n              onChange={(v) => {\n                if (v) {\n                  localStorage.setItem(\"defaultBranchOnly\", \"1\");\n                } else {\n                  localStorage.removeItem(\"defaultBranchOnly\");\n                }\n                setDefaultBranchOnly(v);\n              }}\n            />\n          </Space>\n        </div>\n\n        <div className={\"flex gap-2\"} style={{ display: \"none\" }}>\n          {[\"#1f77b4\", \"#ff7f0e\", \"#2ca02c\"].map((item, index) => {\n            return (\n              <div className={\"flex items-center gap-1\"} key={index}>\n                <span\n                  className={\"block w-[20px] h-[12px] rounded-sm\"}\n                  style={{ backgroundColor: item }}\n                ></span>\n                <span className={\"text-sm\"}>\n                  {{\n                    0: \"手工测试\",\n                    1: \"UI自动化测试\",\n                    2: \"单元测试\",\n                  }[index] || \"unknown\"}\n                </span>\n              </div>\n            );\n          })}\n        </div>\n      </div>\n      {/*div*/}\n      <Table\n        loading={loading}\n        style={{\n          border: `1px solid ${token.colorBorder}`,\n          borderRadius: `${token.borderRadius}px`,\n        }}\n        bordered={false}\n        rowKey={\"sha\"}\n        // @ts-ignore\n        columns={columns}\n        pagination={{\n          showTotal: (total) => t(\"common.total_items\", { total }),\n          total: projectsData?.getProjectRecords?.total,\n          current,\n          pageSize,\n          // current: projectsData?.getProjects?.current,\n          // pageSize: projectsData?.getProjects?.pageSize,\n        }}\n        dataSource={projectsData?.getProjectRecords?.data || []}\n        onChange={(val) => {\n          setCurrent(val.current || 1);\n          setPageSize(val.pageSize || 10);\n          // setKeyword(keyword);\n        }}\n      />\n\n      {/*默太狂就共用一个*/}\n      <ProjectRecordDetailDrawer open={open} onClose={onClose} sha={sha} />\n    </div>\n  );\n};\n\nexport default ProjectOverviewPage;\n","coverage":{"name":"zt"}}