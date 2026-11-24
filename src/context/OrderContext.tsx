import React, { createContext, useContext, useEffect, useState } from 'react';
import { Storage, STORAGE_KEYS } from '../services/storage';
import { CartItem, DeliveryAddress, Order, OrderStatus, OrderStatusHistory } from '../types';

interface PlaceOrderParams {
  items: CartItem[];
  restaurantId: string;
  restaurantName: string;
  restaurantImage: string;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  total: number;
  promoCode?: string;
  deliveryAddress: DeliveryAddress;
  contactPhone: string;
  deliveryInstructions?: string;
  paymentMethod: 'apple_pay' | 'card' | 'cash' | 'wallet';
}

interface OrderContextType {
  orders: Order[];
  activeOrder: Order | null;
  placeOrder: (params: PlaceOrderParams) => Promise<Order>;
  getOrderById: (orderId: string) => Order | undefined;
  advanceOrderStatus: (orderId: string) => void;
  cancelOrder: (orderId: string) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

const STATUS_FLOW: OrderStatus[] = [
  'placed',
  'confirmed',
  'preparing',
  'picked_up',
  'delivered',
];

const buildDefaultTimeline = (createdAt: string): OrderStatusHistory[] => [
  {
    status: 'placed',
    time: 'Just now',
    title: 'Order Placed',
    description: 'We have received your order and notified the restaurant.',
    completed: true,
  },
  {
    status: 'confirmed',
    time: 'Est. 2 mins',
    title: 'Restaurant Confirmed',
    description: 'The kitchen has accepted your ticket.',
    completed: false,
  },
  {
    status: 'preparing',
    time: 'Est. 12 mins',
    title: 'Preparing Food',
    description: 'Fresh ingredients are being cooked with care.',
    completed: false,
  },
  {
    status: 'picked_up',
    time: 'Est. 22 mins',
    title: 'Rider Picked Up Order',
    description: 'David is on the way on an electric scooter.',
    completed: false,
  },
  {
    status: 'delivered',
    time: 'Est. 30 mins',
    title: 'Delivered',
    description: 'Enjoy your hot and delicious meal!',
    completed: false,
  },
];

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    if (isLoaded) {
      Storage.set(STORAGE_KEYS.ORDERS, orders);
    }
  }, [orders, isLoaded]);

  // Realtime order dispatch and driver milestone updates
  useEffect(() => {
    const timer = setInterval(() => {
      setOrders((prev) => {
        let changed = false;
        const updated = prev.map((order) => {
          if (order.status !== 'delivered' && order.status !== 'cancelled') {
            const currentIndex = STATUS_FLOW.indexOf(order.status);
            if (currentIndex >= 0 && currentIndex < STATUS_FLOW.length - 1) {
              // 25% chance per tick (every 8s) to advance, simulating real progression
              if (Math.random() > 0.4) {
                changed = true;
                const nextStatus = STATUS_FLOW[currentIndex + 1];
                const updatedTimeline = order.timeline.map((step) => {
                  const stepIndex = STATUS_FLOW.indexOf(step.status);
                  const nextIndex = STATUS_FLOW.indexOf(nextStatus);
                  return {
                    ...step,
                    completed: stepIndex <= nextIndex,
                  };
                });
                return {
                  ...order,
                  status: nextStatus,
                  timeline: updatedTimeline,
                };
              }
            }
          }
          return order;
        });
        return changed ? updated : prev;
      });
    }, 12000);

    return () => clearInterval(timer);
  }, []);

  const loadOrders = async () => {
    try {
      const saved = await Storage.get<Order[] | null>(STORAGE_KEYS.ORDERS, null);
      if (saved && Array.isArray(saved)) {
        setOrders(saved);
      }
    } catch (e) {
      console.warn('Failed to load orders:', e);
    } finally {
      setIsLoaded(true);
    }
  };

  const placeOrder = async (params: PlaceOrderParams): Promise<Order> => {
    const now = new Date();
    const orderNumber = 'CN-' + Math.floor(100000 + Math.random() * 900000);
    const orderId = 'ord-' + Date.now();

    const newOrder: Order = {
      id: orderId,
      orderNumber,
      restaurantId: params.restaurantId,
      restaurantName: params.restaurantName,
      restaurantImage: params.restaurantImage,
      restaurantPhone: '+1 (555) 839-2041',
      items: params.items,
      subtotal: params.subtotal,
      deliveryFee: params.deliveryFee,
      tax: params.tax,
      discount: params.discount,
      total: params.total,
      promoCode: params.promoCode,
      deliveryAddress: params.deliveryAddress,
      contactPhone: params.contactPhone,
      deliveryInstructions: params.deliveryInstructions,
      paymentMethod: params.paymentMethod,
      status: 'placed',
      estimatedDeliveryTime: '25-35 mins',
      createdAt: now.toISOString(),
      timeline: buildDefaultTimeline(now.toISOString()),
      rider: {
        name: 'David O.',
        phone: '+1 (555) 948-2831',
        photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
        rating: 4.95,
        vehicle: 'Yamaha E-Bike (Black/Green)',
      },
    };

    setOrders((prev) => [newOrder, ...prev]);
    return newOrder;
  };

  const getOrderById = (orderId: string) => {
    return orders.find((o) => o.id === orderId);
  };

  const advanceOrderStatus = (orderId: string) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        const currentIndex = STATUS_FLOW.indexOf(order.status);
        if (currentIndex < STATUS_FLOW.length - 1) {
          const nextStatus = STATUS_FLOW[currentIndex + 1];
          const updatedTimeline = order.timeline.map((step) => {
            const stepIdx = STATUS_FLOW.indexOf(step.status);
            const nextIdx = STATUS_FLOW.indexOf(nextStatus);
            return {
              ...step,
              completed: stepIdx <= nextIdx,
            };
          });
          return {
            ...order,
            status: nextStatus,
            timeline: updatedTimeline,
          };
        }
        return order;
      })
    );
  };

  const cancelOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        return {
          ...order,
          status: 'cancelled' as OrderStatus,
        };
      })
    );
  };

  const activeOrder = orders.find(
    (o) => o.status !== 'delivered' && o.status !== 'cancelled'
  ) || null;

  return (
    <OrderContext.Provider
      value={{
        orders,
        activeOrder,
        placeOrder,
        getOrderById,
        advanceOrderStatus,
        cancelOrder,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};
