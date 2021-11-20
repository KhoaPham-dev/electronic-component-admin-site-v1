import React from "react";
import { connect } from "react-redux";
import { Avatar, Tag, Button, Modal, Divider } from "antd";
import { TableOutlined, PlusOutlined, EditOutlined} from "@ant-design/icons";

import ListBasePage from "../ListBasePage";
import OrdersForm from "../../compoments/orders/OrdersForm";
import BaseTable from "../../compoments/common/table/BaseTable";
import BasicModal from "../../compoments/common/modal/BasicModal";
import qs from 'query-string';

import { actions } from "../../actions";
import { FieldTypes } from "../../constants/formConfig";
import { convertUtcToTimezone } from "../../utils/datetimeHelper";
import { AppConstants } from "../../constants";
import {categoryKinds} from "../../constants/masterData";
import ElementWithPermission from "../../compoments/common/elements/ElementWithPermission";
import { showErrorMessage, showSucsessMessage } from '../../services/notifyService';
import {sitePathConfig} from '../../constants/sitePathConfig';
import { OrdersStates } from "../../constants";
import Utils from '../../utils/index'

const {confirm} = Modal

class OrdersListPage extends ListBasePage {
  initialSearch() {
    return { code: "", state: null};
  }

  constructor(props) {
    super(props);
    this.objectName =  "Đơn hàng";
    this.breadcrumbs = [{ name: "Đơn hàng" }];
    this.categoryId = undefined;
    this.search = this.initialSearch();
    this.dataDetail = {};
    this.columns = [
      this.renderIdColumn(),
      { title: 'Mã đơn hàng', dataIndex: "ordersCode", width: 115, render: (ordersCode, dataRow) => {
        return <div>#{ordersCode}</div>
    }},
      {
        title: <div style={{ paddingRight: 20 }}>Ngày tạo</div>,
                dataIndex: "createdDate",
                align: "right",
                width: 100,
                render: (createdDate) => <div style={{ paddingRight: 20, whiteSpace: 'nowrap' }}>{convertUtcToTimezone(createdDate, Utils.getSettingsDateFormat("date-format-product"))}</div>,
      },
      {
        title: "Họ và tên khách hàng",
        dataIndex: ['customerDto', 'customerFullName'],
        render: (customerFullName, dataRow) => {
            return (
                <div>
                    {customerFullName}
                </div>
            )
        }
    },
    {
        title: <div className="tb-al-r">Tổng tiền</div>,
        dataIndex: 'ordersTotalMoney',
        align: 'right',
        width: 100,
        render: (ordersTotalMoney, dataRow) => {
            return (
                <div className="tb-al-r force-one-line">
                    {Utils.formatMoney(ordersTotalMoney)}
                </div>
            )
        }
    },
    {
        title: 'Trạng thái đơn hàng',
        dataIndex: 'ordersState',
        width: 90,
        render: (ordersState, dataRow) => {
            const state = OrdersStates.find(state => state.value === ordersState);
            return (
                <div>
                    <Tag style={
                        {
                            background: state?.color,
                            color: 'white',
                            padding: '2px 7px',
                            fontSize: '14px',
                            width: 88,
                            textAlign: 'center',
                        }
                    }>{state?.label}</Tag>
                </div>
            )
        }
    },
      this.renderActionColumn(),
    ];
    this.actionColumns = {
      isEdit: {
        icon: <EditOutlined />
    },
      isDelete: false,
      isChangeStatus: false,
    };
  }

  renderActionColumn() {
    return {
        title: 'Hành động',
        width: '100px',
        align: 'center',
        render: (dataRow) => {
            const { requiredPermissions } = this.props;
            const actionColumns = [];
            if(this.actionColumns.isEdit) {
                actionColumns.push(this.renderButtonVerTwo((
                    <Button type="link" onClick={(e) => {
                        e.stopPropagation()
                        this.getDetail(dataRow.id)
                    }} className="no-padding">
                        { this.actionColumns.isEdit.icon || <EditOutlined/> }
                    </Button>
                ), [
                    ...requiredPermissions || [
                        sitePathConfig.orders.permissions[1],
                        sitePathConfig.orders.permissions[3]
                    ]
                ]))
            }
            const actionColumnsWithDivider = [];
            actionColumns.forEach((action, index) => {
                actionColumnsWithDivider.push(action);
                if(index !== (actionColumns.length -1))
                {
                    actionColumnsWithDivider.push(<Divider type="vertical" />);
                }
            })
            return (
                <span>
                    {
                        actionColumnsWithDivider.map((action, index) => <span key={index}>{action}</span>)
                    }
                </span>
            )
        }
    }  
}

  componentWillReceiveProps(nextProps) {
    if(nextProps.location.search !== this.props.location.search) {
        this.loadDataTable(nextProps);
    }
    if(nextProps.keyTab !== this.props.keyTab) {
        if(this.breadcrumbs.length > 0) {
            this.props.changeBreadcrumb(this.breadcrumbs);
        }
    }
  }

  handleRoutingParent(prName) {
    const { location: { search } } = this.props;
    const queryString = qs.parse(search);
    const result = {};
    Object.keys(queryString).map(q => {
        if(q.startsWith(prName))
            result[q.substring(prName.length, q.length)] = queryString[q];
    })
    const qsMark = Object.keys(result).length > 0 ? "?" : "";
    return qsMark + qs.stringify(result);
}

  getSearchFields() {
    return [
      {
        key: "code",
        seachPlaceholder: 'Mã sản phẩm',
        initialValue: this.search.code,
      },
      {
        key: "state",
        seachPlaceholder: 'Chọn trạng thái sản phẩm',
        fieldType: FieldTypes.SELECT,
        options: OrdersStates,
        initialValue: this.search.state,
      },
    ];
  }

  handleCancelStateNoConfirm = (values) => {
    const { updateStateOrders, cancelOrders, t } = this.props
    this.setState({
        isShowModifiedLoading: true,
        disableButton: 'all',
    })
    cancelOrders({
        params: {
            ...values,
        },
        onCompleted: () => {
            this.getList()
            this.getDetail(this.dataDetail.id)
            showSucsessMessage(t("showSuccessMessage.update") , { t, ns: 'listBasePage' })
            this.setState({
                isShowModifiedLoading: false,
                disableButton: null,
            })
        },
        onError: (error) => {
            showErrorMessage(error.message || t("showErrorMessage.update"), { t, ns: 'listBasePage' })
            this.setState({
                isShowModifiedLoading: false,
                disableButton: null,
            })
        }
    })
}

  handleUpdateState = (values) => {
      const { updateStateOrders, cancelOrders, t } = this.props
      confirm({
          title: t("confirmUpdateState"),
          content: '',
          okText: t("yes"),
          okType: 'danger',
          cancelText: t("no"),
          onOk: () => {
              this.setState({
                  isShowModifiedLoading: true,
                  disableButton: values.ordersState === OrdersStates[4].value ? 'cancel-orders' : 'all'
              })
              if(values.ordersState != OrdersStates[4].value) {
                  updateStateOrders({
                      params: {
                          ...values,
                      },
                      onCompleted: () => {
                          this.getList()
                          this.getDetail(this.dataDetail.id)
                          showSucsessMessage(t("showSuccessMessage.update") , { t, ns: 'listBasePage' })
                          this.setState({
                              isShowModifiedLoading: false,
                              disableButton: null,
                          })
                      },
                      onError: (error) => {
                          showErrorMessage(error.message || t("showErrorMessage.update"), { t, ns: 'listBasePage' })
                          this.setState({
                              isShowModifiedLoading: false,
                              disableButton: null,
                          })
                      }
                  })
              }
              else {
                  cancelOrders({
                      params: {
                          ...values,
                      },
                      onCompleted: () => {
                          this.getList()
                          this.getDetail(this.dataDetail.id)
                          showSucsessMessage(t("showSuccessMessage.update") , { t, ns: 'listBasePage' })
                          this.setState({
                              isShowModifiedLoading: false,
                              disableButton: null,
                          })
                      },
                      onError: (error) => {
                          showErrorMessage(error.message || t("showErrorMessage.update"), { t, ns: 'listBasePage' })
                          this.setState({
                              isShowModifiedLoading: false,
                              disableButton: null,
                          })
                      }
                  })
              }
          },
          onCancel() {
            // console.log('Cancel');
          },
        });
  }

  handleUpdate = (values) => {
      const { updateData, t } = this.props
      this.setState({
          isShowModifiedLoading: true,
          disableButton: 'update-orders',
      })
      updateData({
          params: {
              ...values,
          },
          onCompleted: () => {
              this.getList()
              showSucsessMessage(t("showSuccessMessage.update") , { t, ns: 'listBasePage' })
              this.setState({
                  isShowModifiedLoading: false,
                  isShowModifiedModal: false,
                  disableButton: null,
              })
          },
          onError: (error) => {
              showErrorMessage(error.message || t("showErrorMessage.update"), { t, ns: 'listBasePage' })
              this.setState({
                  isShowModifiedLoading: false,
                  disableButton: null,
              })
          }
      })
  }

  renderUpdateButtons = () => {
      const { t } = this.props;
      const { isShowModifiedLoading, disableButton } = this.state;
      return (<>
          <ElementWithPermission permissions={[sitePathConfig.orders.permissions[4]]}>
              <Button
              type="primary"
              loading={disableButton === "cancel-orders"}
              disabled={isShowModifiedLoading || disableButton === "all"}
              className={
                  this.dataDetail.ordersState === OrdersStates[3].value
                  || this.dataDetail.ordersState === OrdersStates[4].value
                  ? 'btn-cancel-orders disabled' : 'btn-cancel-orders'
              }
              onClick={
                  () => this.dataDetail.ordersState !== OrdersStates[3].value
                      && this.dataDetail.ordersState !== OrdersStates[4].value
                      && this.handleUpdateState({
                          id: this.dataDetail.id,
                          ordersState: OrdersStates[4].value
                      })
              }
              >
                  {t("cancelOrders")}
              </Button>
          </ElementWithPermission>
          <ElementWithPermission permissions={[sitePathConfig.orders.permissions[5]]}>
              <Button
              htmlType="submit"
              form="customer-info-form"
              type="primary"
              loading={disableButton === "update-orders"}
              disabled={isShowModifiedLoading || disableButton === "all"}
              className={
                  this.dataDetail.ordersState > OrdersStates[0].value
                  ? 'btn-update-orders disabled' : 'btn-update-orders'
              }
              >
                  {t("save")}
              </Button>
          </ElementWithPermission>
      </>
      )
  }

  handleMatchBackgroundColor = (dataRow) => {
      const { randomColorsArrayByEmployeeId } = this.state;
      const key = Object.keys(randomColorsArrayByEmployeeId || {}).find(key => dataRow.employeeDto.id == key);
      return randomColorsArrayByEmployeeId?.[key] || '#fff';
  }

  handleSubmit = (values) => {
      this.dataDetail.ordersState === OrdersStates[0].value
      && this.handleUpdate(values)
  }

  getList() {
    const { getDataList } = this.props;
        const page = this.pagination.current ? this.pagination.current - 1 : 0;
        const params = { page, size: this.pagination.pageSize, search: this.search};
        getDataList({ params });
  }

  getDetail(id) {
    const { getDataById, showFullScreenLoading, hideFullScreenLoading } = this.props;
    const params = { id };
    showFullScreenLoading();
    getDataById({
        params,
        onCompleted: ({data}) => {
            this.dataDetail = this.getDataDetailMapping(data);
            this.onShowModifiedModal(true);
            hideFullScreenLoading();
        },
        onError: (err) => {
            if(err && err.message)
                showErrorMessage(err.message);
            else
                showErrorMessage(`${this.getActionName()} ${this.objectName} thất bại. Vui lòng thử lại!`);
            hideFullScreenLoading();
        }
    });
}

  prepareCreateData(data) {

    return {
      ...data
    }
  }

  prepareUpdateData(data) {
    return {
      ...data,
      id: this.dataDetail.id
    }
  }

  render() {
    const {
      dataList,
      loading,
      uploadFile,
    } = this.props;

    console.log('sfdf');

    const { isShowModifiedModal, isShowModifiedLoading } = this.state;
    const orders = dataList.data || [];
    this.pagination.total = dataList.totalElements || 0;
    return (
      <div>
        {this.renderSearchForm()}
        <div className="action-bar">
          {
            this.renderCreateNewButton((
              <Button
              type="primary"
              onClick={() => this.onShowModifiedModal(false)}
            >
              <PlusOutlined /> Thêm mới
            </Button>
            ))
          }
        </div>
        <BaseTable
          loading={loading}
          columns={this.columns}
          rowKey={(record) => record.id}
          dataSource={orders}
          pagination={this.pagination}
          onChange={this.handleTableChange}
        />
        <BasicModal
          visible={isShowModifiedModal}
          isEditing={this.isEditing}
          objectName={this.objectName}
          loading={isShowModifiedLoading}
          onOk={this.onOkModal}
          onCancel={this.onCancelModal}
        >
          <OrdersForm
                dataDetail={this.isEditing ? this.dataDetail : {}}
                handleUpdateState={this.handleUpdateState}
                handleSubmit={this.handleSubmit}
                handleCancelStateNoConfirm={this.handleCancelStateNoConfirm}
                loadingSave={isShowModifiedLoading}
            />
        </BasicModal>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  loading: state.orders.tbordersLoading,
  dataList: state.orders.ordersData || {},
});

const mapDispatchToProps = (dispatch) => ({
  getDataList: (payload) => dispatch(actions.getOrdersList(payload)),
});

export default connect(mapStateToProps, mapDispatchToProps)(OrdersListPage);