'use client'

import React, { useState, useEffect } from 'react';
import {
  Package,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Search,
  RefreshCw,
  FileText,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { orderService, Order, OrderStats } from '../../services/orderService';
import { useCurrency } from '../../contexts/CurrencyContext';

interface OrderManagementProps {
  isFBOnly?: boolean;
}

const OrderItemThumb: React.FC<{
  src?: string | null;
  alt: string;
}> = ({ src, alt }) => {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div className="w-9 h-9 shrink-0 rounded border border-gray-200 bg-gray-100 flex items-center justify-center">
        <Package className="w-4 h-4 text-gray-400" />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      className="w-9 h-9 shrink-0 rounded border border-gray-200 object-cover"
      onError={() => setFailed(true)}
    />
  );
};

const OrderManagement: React.FC<OrderManagementProps> = ({ isFBOnly = false }) => {
  const { formatCurrency, currencySettings, convertAmount } = useCurrency();
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats>({
    total: 0,
    pending: 0,
    processing: 0,
    completed: 0,
    cancelled: 0,
    refunded: 0,
    totalRevenue: 0,
    todayOrders: 0,
    todayRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  const loadOrders = async () => {
    try {
      setLoading(true);
      const ordersData = await orderService.getAllOrders();

      const filtered = isFBOnly
        ? ordersData.filter((order) =>
            order.order_items?.some((item) => {
              const title = (item.product_title || '').toLowerCase();
              const productTitle = (item.products?.title || '').toLowerCase();
              const combined = `${title} ${productTitle}`;
              return (
                combined.includes('food & beverage') ||
                combined.includes('f&b') ||
                combined.includes('f & b') ||
                combined.includes('dry fruit') ||
                combined.includes('dried fruit') ||
                combined.includes('spice')
              );
            })
          )
        : ordersData;

      setOrders(filtered);
      calculateStats(filtered);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (ordersData: Order[]) => {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    const todayOrders = ordersData.filter((order) => {
      const orderDate = new Date(order.created_at);
      return orderDate >= todayStart && orderDate < todayEnd;
    });

    const totalRevenue = ordersData.reduce((sum, order) => {
      const orderCurrency = order.currency_code || 'INR';
      const convertedAmount = convertAmount(
        order.total_amount,
        orderCurrency,
        currencySettings.defaultCurrency
      );
      return sum + convertedAmount;
    }, 0);

    const todayRevenue = todayOrders.reduce((sum, order) => {
      const orderCurrency = order.currency_code || 'INR';
      const convertedAmount = convertAmount(
        order.total_amount,
        orderCurrency,
        currencySettings.defaultCurrency
      );
      return sum + convertedAmount;
    }, 0);

    setStats({
      total: ordersData.length,
      pending: ordersData.filter((o) => o.status === 'pending').length,
      processing: ordersData.filter((o) => o.status === 'processing').length,
      completed: ordersData.filter((o) => o.status === 'completed').length,
      cancelled: ordersData.filter((o) => o.status === 'cancelled').length,
      refunded: ordersData.filter((o) => o.status === 'refunded').length,
      totalRevenue,
      todayOrders: todayOrders.length,
      todayRevenue,
    });
  };

  const handleUpdateStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      const success = await orderService.updateOrderStatus(orderId, newStatus);
      if (success) {
        await loadOrders();
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrders((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) next.delete(orderId);
      else next.add(orderId);
      return next;
    });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const filteredOrders = orders
    .filter((order) => {
      const matchesSearch =
        order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = filterStatus === 'all' || order.status === filterStatus;

      let matchesDate = true;
      if (filterDate !== 'all') {
        const orderDate = new Date(order.created_at);
        const today = new Date();

        switch (filterDate) {
          case 'today':
            matchesDate = orderDate.toDateString() === today.toDateString();
            break;
          case 'week': {
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            matchesDate = orderDate >= weekAgo;
            break;
          }
          case 'month': {
            const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
            matchesDate = orderDate >= monthAgo;
            break;
          }
        }
      }

      return matchesSearch && matchesStatus && matchesDate;
    })
    .sort((a, b) => {
      let aValue: string | number = a[sortBy as keyof Order] as string | number;
      let bValue: string | number = b[sortBy as keyof Order] as string | number;

      if (sortBy === 'created_at' || sortBy === 'updated_at') {
        aValue = new Date(aValue as string).getTime();
        bValue = new Date(bValue as string).getTime();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      }
      return aValue < bValue ? 1 : -1;
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 text-green-800 ring-1 ring-inset ring-green-600/20';
      case 'processing':
        return 'bg-blue-50 text-blue-800 ring-1 ring-inset ring-blue-600/20';
      case 'pending':
        return 'bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-600/20';
      case 'cancelled':
        return 'bg-red-50 text-red-800 ring-1 ring-inset ring-red-600/20';
      case 'refunded':
        return 'bg-gray-100 text-gray-700 ring-1 ring-inset ring-gray-500/20';
      default:
        return 'bg-gray-100 text-gray-700 ring-1 ring-inset ring-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    const cls = 'w-3 h-3 shrink-0';
    switch (status) {
      case 'completed':
        return <CheckCircle className={cls} />;
      case 'processing':
        return <Clock className={cls} />;
      case 'pending':
        return <Clock className={cls} />;
      case 'cancelled':
        return <XCircle className={cls} />;
      case 'refunded':
        return <AlertCircle className={cls} />;
      default:
        return <Clock className={cls} />;
    }
  };

  const inputCls =
    'h-8 rounded-md border border-gray-200 bg-white px-2 text-xs text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900';

  const statItems: {
    label: string;
    value: React.ReactNode;
    Icon?: typeof Package;
    iconClass?: string;
  }[] = [
    { label: 'Total', value: stats.total, Icon: Package, iconClass: 'text-blue-600' },
    { label: 'Pending', value: stats.pending, Icon: Clock, iconClass: 'text-amber-600' },
    { label: 'Processing', value: stats.processing, Icon: Clock, iconClass: 'text-blue-600' },
    { label: 'Done', value: stats.completed, Icon: CheckCircle, iconClass: 'text-green-600' },
    { label: 'Cancelled', value: stats.cancelled, Icon: XCircle, iconClass: 'text-red-600' },
    { label: 'Refunded', value: stats.refunded, Icon: AlertCircle, iconClass: 'text-gray-600' },
    { label: 'Today', value: stats.todayOrders, Icon: Calendar, iconClass: 'text-gray-600' },
    {
      label: 'Revenue',
      value: formatCurrency(stats.totalRevenue, currencySettings.defaultCurrency),
      Icon: DollarSign,
      iconClass: 'text-green-600',
    },
    {
      label: 'Today $',
      value: formatCurrency(stats.todayRevenue, currencySettings.defaultCurrency),
      Icon: DollarSign,
      iconClass: 'text-green-700',
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Order Management</h2>
          <p className="text-xs text-gray-500">Orders and payments</p>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 text-xs font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5 rounded-lg border border-gray-200 bg-gray-50/80 p-2">
        {statItems.map(({ label, value, Icon, iconClass }) => (
          <div
            key={label}
            className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2 py-1"
          >
            {Icon && (
              <Icon className={`h-3.5 w-3.5 shrink-0 ${iconClass || 'text-gray-500'}`} />
            )}
            <span className="text-[11px] text-gray-500">{label}</span>
            <span className="text-xs font-semibold tabular-nums text-gray-900">{value}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-gray-200 bg-white p-2">
        <div className="relative flex min-w-[10rem] flex-1 max-w-xs items-center">
          <Search className="pointer-events-none absolute left-2 h-3.5 w-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search name, email, id…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`${inputCls} w-full pl-7`}
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className={`${inputCls} min-w-[6.5rem]`}
        >
          <option value="all">All status</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="refunded">Refunded</option>
        </select>
        <select
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className={`${inputCls} min-w-[6.5rem]`}
        >
          <option value="all">All time</option>
          <option value="today">Today</option>
          <option value="week">7 days</option>
          <option value="month">30 days</option>
        </select>
        <select
          value={`${sortBy}-${sortOrder}`}
          onChange={(e) => {
            const [field, order] = e.target.value.split('-');
            setSortBy(field);
            setSortOrder(order as 'asc' | 'desc');
          }}
          className={`${inputCls} min-w-[8.5rem]`}
        >
          <option value="created_at-desc">Newest</option>
          <option value="created_at-asc">Oldest</option>
          <option value="total_amount-desc">Amount ↓</option>
          <option value="total_amount-asc">Amount ↑</option>
          <option value="customer_name-asc">Customer A–Z</option>
          <option value="customer_name-desc">Customer Z–A</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-10 text-sm text-gray-500">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Loading…
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-200 py-10 text-center">
          <Package className="mx-auto h-8 w-8 text-gray-300" />
          <p className="mt-2 text-sm font-medium text-gray-800">No orders</p>
          <p className="text-xs text-gray-500">Adjust search or filters</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {filteredOrders.map((order) => {
            const shortId = order.id.slice(-8);
            const initials = order.customer_name
              .split(' ')
              .map((n: string) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2);
            return (
              <div
                key={order.id}
                className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
              >
                <div
                  role="button"
                  tabIndex={0}
                  className="flex w-full cursor-pointer items-center gap-2 p-2 text-left hover:bg-gray-50 sm:gap-3 sm:p-2.5"
                  onClick={() => toggleOrderExpansion(order.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleOrderExpansion(order.id);
                    }
                  }}
                >
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gray-200 text-[10px] font-bold text-gray-700">
                      {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-mono text-xs font-semibold text-gray-900">
                          #{shortId}
                        </span>
                        <span
                          className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-medium capitalize ${getStatusColor(order.status)}`}
                        >
                          {getStatusIcon(order.status)}
                          {order.status}
                        </span>
                      </div>
                      <p className="truncate text-xs text-gray-700">{order.customer_name}</p>
                      <p className="truncate font-mono text-[10px] text-gray-400">
                        {order.customer_email}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <div className="text-right">
                      <p className="text-sm font-semibold tabular-nums text-gray-900">
                        {formatCurrency(order.total_amount, order.currency_code || 'INR')}
                      </p>
                      <p className="text-[10px] text-gray-500">
                        {new Date(order.created_at).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: '2-digit',
                        })}
                      </p>
                    </div>
                    <select
                      value={order.status}
                      onChange={(e) =>
                        handleUpdateStatus(order.id, e.target.value as Order['status'])
                      }
                      className={`${inputCls} max-w-[7rem]`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="refunded">Refunded</option>
                    </select>
                    <span className="text-gray-400">
                      {expandedOrders.has(order.id) ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </span>
                  </div>
                </div>

                {expandedOrders.has(order.id) && (
                  <div className="border-t border-gray-100 bg-gray-50/90 px-2 pb-2 pt-1.5 sm:px-2.5">
                    <div className="grid gap-2 lg:grid-cols-2 lg:gap-3">
                      <div className="rounded-md border border-gray-200 bg-white p-2">
                        <h4 className="mb-1.5 flex items-center gap-1 text-xs font-semibold text-gray-900">
                          <Package className="h-3.5 w-3.5 text-gray-600" />
                          Items
                        </h4>
                        <div className="space-y-1">
                          {order.order_items.map((item) => (
                            <div
                              key={item.id}
                              className="flex gap-2 rounded border border-gray-100 bg-gray-50/50 p-1.5 text-xs"
                            >
                              <OrderItemThumb
                                src={item.products?.main_image || item.product_image}
                                alt={item.product_title}
                              />
                              <div className="min-w-0 flex-1">
                                <p className="font-medium leading-tight text-gray-900">
                                  {item.product_title}
                                </p>
                                <div className="mt-0.5 text-[11px] text-gray-600">
                                  {(() => {
                                    const isClothing =
                                      item.selected_product_type === 'clothing' ||
                                      (item.options && (item.options.color || item.options.size)) ||
                                      (item.product_title &&
                                        [
                                          'sweatshirt',
                                          'hoodie',
                                          't-shirt',
                                          'shirt',
                                          'jacket',
                                          'sweater',
                                          'crewneck',
                                          'oversized',
                                        ].some((k) =>
                                          item.product_title!.toLowerCase().includes(k)
                                        ));

                                    if (isClothing && item.options && (item.options.color || item.options.size)) {
                                      return (
                                        <div className="flex flex-wrap gap-0.5">
                                          {item.options.color && (
                                            <span className="rounded bg-purple-100 px-1 py-0 text-[10px] text-purple-800">
                                              {item.options.color}
                                            </span>
                                          )}
                                          {item.options.size && (
                                            <span className="rounded bg-blue-100 px-1 py-0 text-[10px] text-blue-800">
                                              {item.options.size}
                                            </span>
                                          )}
                                          <span className="rounded bg-gray-200 px-1 py-0 text-[10px] text-gray-800">
                                            ×{item.quantity}
                                          </span>
                                        </div>
                                      );
                                    }
                                    if (isClothing) {
                                      const hasSizeInPosterSize =
                                        item.selected_poster_size &&
                                        item.selected_product_type === 'poster';
                                      return (
                                        <div className="flex flex-wrap gap-0.5">
                                          <span className="rounded bg-orange-100 px-1 py-0 text-[10px]">
                                            Clothing
                                          </span>
                                          {hasSizeInPosterSize && (
                                            <span className="rounded bg-blue-100 px-1 py-0 text-[10px]">
                                              {item.selected_poster_size}
                                            </span>
                                          )}
                                          <span className="text-gray-600">Qty {item.quantity}</span>
                                          {hasSizeInPosterSize && (
                                            <span className="rounded bg-red-100 px-1 py-0 text-[10px]">
                                              Data issue
                                            </span>
                                          )}
                                        </div>
                                      );
                                    }
                                    return (
                                      <>
                                        <span className="capitalize">
                                          {item.selected_product_type === 'poster' ? 'Poster' : 'Digital'}
                                        </span>
                                        {item.selected_product_type === 'poster' &&
                                          item.selected_poster_size && (
                                            <span className="ml-1 rounded bg-green-100 px-1 text-[10px]">
                                              {item.selected_poster_size}
                                            </span>
                                          )}
                                        <span className="text-gray-500"> · Qty {item.quantity}</span>
                                      </>
                                    );
                                  })()}
                                </div>
                              </div>
                              <div className="shrink-0 text-right">
                                <p className="font-semibold tabular-nums text-gray-900">
                                  {formatCurrency(item.total_price, order.currency_code || 'INR')}
                                </p>
                                <p className="text-[10px] text-gray-500">
                                  {formatCurrency(item.unit_price, order.currency_code || 'INR')} ea
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="rounded-md border border-gray-200 bg-white p-2">
                          <h4 className="mb-1.5 flex items-center gap-1 text-xs font-semibold text-gray-900">
                            <FileText className="h-3.5 w-3.5 text-gray-600" />
                            Details
                          </h4>
                          <dl className="space-y-1 text-[11px]">
                            <div className="flex justify-between gap-2">
                              <dt className="text-gray-500">Payment</dt>
                              <dd className="font-medium capitalize text-gray-900">
                                {order.payment_method}
                              </dd>
                            </div>
                            {order.payment_id && (
                              <div className="flex justify-between gap-2">
                                <dt className="text-gray-500">Payment ID</dt>
                                <dd className="max-w-[60%] truncate font-mono text-gray-800">
                                  {order.payment_id}
                                </dd>
                              </div>
                            )}
                            <div className="flex justify-between gap-2">
                              <dt className="text-gray-500">Created</dt>
                              <dd className="text-right text-gray-800">
                                {new Date(order.created_at).toLocaleString()}
                              </dd>
                            </div>
                            <div className="flex justify-between gap-2">
                              <dt className="text-gray-500">Updated</dt>
                              <dd className="text-right text-gray-800">
                                {new Date(order.updated_at).toLocaleString()}
                              </dd>
                            </div>
                          </dl>
                        </div>
                        {order.shipping_address && (
                          <div className="rounded-md border border-gray-200 bg-white p-2 text-[11px]">
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                              Shipping
                            </p>
                            <p className="mt-0.5 leading-snug text-gray-800">
                              {order.shipping_address}
                            </p>
                          </div>
                        )}
                        {order.notes && (
                          <div className="rounded-md border border-gray-200 bg-white p-2 text-[11px]">
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                              Notes
                            </p>
                            <p className="mt-0.5 leading-snug text-gray-800">{order.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
