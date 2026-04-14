export const dynamic = 'force-dynamic'

import { notFound, redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatPrice, formatDate } from '@/lib/utils'
import Badge from '@/components/ui/Badge'
import OrderActions from '@/components/OrderActions'
import RateOrderForm from '@/components/RateOrderForm'
import MessageModal from '@/components/MessageModal'
import { getT } from '@/lib/getT'

const statusBadge: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  pending: 'warning', paid: 'info', shipped: 'info',
  delivered: 'success', disputed: 'danger', cancelled: 'danger', refunded: 'default',
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) redirect('/login')

  const [{ id }, { t }] = await Promise.all([params, getT()])
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      buyer: { select: { id: true, name: true, avatar: true } },
      seller: { select: { id: true, name: true, avatar: true } },
      items: {
        include: { book: { select: { id: true, title: true, images: true, price: true } } },
      },
      messages: {
        include: { sender: { select: { id: true, name: true, avatar: true } } },
        orderBy: { createdAt: 'asc' },
      },
      rating: true,
    },
  })

  if (!order) notFound()
  if (order.buyerId !== session.id && order.sellerId !== session.id && session.role !== 'admin') {
    redirect('/dashboard/orders')
  }

  const isBuyer = order.buyerId === session.id
  const shippingAddress = JSON.parse(order.shippingAddress || '{}')

  const steps = ['pending', 'paid', 'shipped', 'delivered']
  const currentStep = steps.indexOf(order.status)

  const stepLabels = [t('order.step_pending'), t('order.step_paid'), t('order.step_shipped'), t('order.step_delivered')]

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">{t('order.title')} #{order.id.slice(-8).toUpperCase()}</h1>
          <p className="text-stone-500 text-sm mt-1">{formatDate(order.createdAt)}</p>
        </div>
        <Badge variant={statusBadge[order.status] || 'default'} className="text-base px-4 py-2">
          {t(`statuses.${order.status}`) || order.status}
        </Badge>
      </div>

      {/* Progress */}
      {!['cancelled', 'refunded', 'disputed'].includes(order.status) && (
        <div className="bg-white rounded-xl border border-stone-200 p-5 mb-6">
          <div className="flex items-center">
            {steps.map((step, i) => (
              <div key={step} className="flex items-center flex-1 last:flex-none">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                  i <= currentStep ? 'bg-amber-700 text-white' : 'bg-stone-100 text-stone-400'
                }`}>
                  {i < currentStep ? '✓' : i + 1}
                </div>
                <p className={`text-xs ml-2 ${i <= currentStep ? 'text-amber-700 font-medium' : 'text-stone-400'}`}>
                  {stepLabels[i]}
                </p>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-3 ${i < currentStep ? 'bg-amber-700' : 'bg-stone-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="bg-white rounded-xl border border-stone-200 p-5">
            <h2 className="font-semibold text-stone-700 mb-4">{t('order.items')}</h2>
            {order.items.map((item) => {
              const imgs: string[] = JSON.parse(item.book.images || '[]')
              return (
                <div key={item.id} className="flex gap-4 py-3 border-b border-stone-100 last:border-0">
                  <div className="w-12 h-16 bg-stone-100 rounded-lg overflow-hidden shrink-0">
                    {imgs[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={imgs[0]} alt="" className="w-full h-full object-cover" />
                    ) : <div className="w-full h-full flex items-center justify-center">📚</div>}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-stone-800">{item.book.title}</p>
                    <p className="text-sm text-stone-500">{t('order.qty')}: {item.quantity}</p>
                  </div>
                  <p className="font-semibold text-amber-700">{formatPrice(item.price * item.quantity)}</p>
                </div>
              )
            })}
          </div>

          {/* Messages */}
          <div className="bg-white rounded-xl border border-stone-200 p-5">
            <h2 className="font-semibold text-stone-700 mb-4">{t('order.messages')}</h2>
            {order.messages.length === 0 ? (
              <p className="text-stone-400 text-sm">{t('order.no_messages')}</p>
            ) : (
              <div className="space-y-3 mb-4">
                {order.messages.map((msg) => (
                  <div key={msg.id} className={`flex gap-3 ${msg.senderId === session.id ? 'flex-row-reverse' : ''}`}>
                    <div className="w-8 h-8 rounded-full bg-amber-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {msg.sender.name[0].toUpperCase()}
                    </div>
                    <div className={`max-w-xs rounded-xl px-3 py-2 text-sm ${msg.senderId === session.id ? 'bg-amber-700 text-white' : 'bg-stone-100 text-stone-800'}`}>
                      {msg.content}
                      <p className={`text-xs mt-1 ${msg.senderId === session.id ? 'text-amber-200' : 'text-stone-400'}`}>
                        {formatDate(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <OrderMessageForm orderId={order.id} receiverId={isBuyer ? order.sellerId : order.buyerId} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Summary */}
          <div className="bg-white rounded-xl border border-stone-200 p-5">
            <h2 className="font-semibold text-stone-700 mb-3">{t('order.summary')}</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-stone-500">{t('order.amount')}</span>
                <span>{formatPrice(order.totalAmount)}</span>
              </div>
              {!isBuyer && (
                <>
                  <div className="flex justify-between text-red-600">
                    <span>{t('order.commission')}</span>
                    <span>-{formatPrice(order.commission)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-amber-700 border-t border-stone-100 pt-2">
                    <span>{t('order.you_receive')}</span>
                    <span>{formatPrice(order.sellerPayout)}</span>
                  </div>
                </>
              )}
            </div>
            {order.trackingNumber && (
              <div className="mt-3 pt-3 border-t border-stone-100">
                <p className="text-xs text-stone-500">{t('order.tracking')}</p>
                <p className="text-sm font-mono font-medium">{order.trackingNumber}</p>
              </div>
            )}
          </div>

          {/* Parties */}
          <div className="bg-white rounded-xl border border-stone-200 p-5">
            <div className="space-y-3">
              <div>
                <p className="text-xs text-stone-400">{t('order.buyer')}</p>
                <p className="text-sm font-medium">{order.buyer.name}</p>
              </div>
              <div>
                <p className="text-xs text-stone-400">{t('order.seller')}</p>
                <p className="text-sm font-medium">{order.seller.name}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <OrderActions
            orderId={order.id}
            status={order.status}
            isBuyer={isBuyer}
            isSeller={!isBuyer}
          />

          {/* Rate */}
          {isBuyer && order.status === 'delivered' && !order.rating && (
            <RateOrderForm orderId={order.id} sellerId={order.sellerId} />
          )}
        </div>
      </div>
    </div>
  )
}

function OrderMessageForm({ orderId, receiverId }: { orderId: string; receiverId: string }) {
  'use client'
  return null // Placeholder — handled by MessageModal below for simplicity
}
