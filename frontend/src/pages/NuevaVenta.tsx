import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CheckCircle,
  Wrench,
  Car,
  Image as ImageIcon
} from 'lucide-react';
import api from '../services/api';
import { Repuesto, Orden } from '../types';
import { ReceiptModal } from '../components/ReceiptModal';
import Swal from 'sweetalert2';

interface CartItem {
  repuesto: Repuesto;
  cantidad: number;
  precioUnitario: number;
}

export const NuevaVenta: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [descuento, setDescuento] = useState<number>(0);

  const [placa, setPlaca] = useState('');
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [clienteNombre, setClienteNombre] = useState('');
  const [clienteTelefono, setClienteTelefono] = useState('');
  const [descripcionFalla, setDescripcionFalla] = useState('');

  const [createdOrden, setCreatedOrden] = useState<Orden | null>(null);

  const { data: repuestos, isLoading } = useQuery<Repuesto[]>({
    queryKey: ['repuestos-catalog', search],
    queryFn: async () => {
      const res = await api.get('/repuestos', { params: { search } });
      return res.data;
    },
  });

  const addToCart = (repuesto: Repuesto) => {
    if (repuesto.stockActual <= 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Sin existencias',
        text: `El artículo "${repuesto.nombre}" no cuenta con unidades disponibles.`,
      });
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.repuesto.id === repuesto.id);
      if (existing) {
        if (existing.cantidad >= repuesto.stockActual) {
          Swal.fire({
            icon: 'info',
            title: 'Límite de stock alcanzado',
            text: `Solo hay ${repuesto.stockActual} unidades disponibles en inventario.`,
          });
          return prev;
        }
        return prev.map((item) =>
          item.repuesto.id === repuesto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item,
        );
      }
      return [...prev, { repuesto, cantidad: 1, precioUnitario: Number(repuesto.precioFinal) }];
    });
  };

  const updateQuantity = (repuestoId: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.repuesto.id === repuestoId) {
            const newQty = item.cantidad + delta;
            if (newQty > item.repuesto.stockActual) {
              Swal.fire({
                icon: 'info',
                title: 'Límite de existencias',
                text: `Existencia física máxima: ${item.repuesto.stockActual} unidades.`,
              });
              return item;
            }
            return { ...item, cantidad: newQty };
          }
          return item;
        })
        .filter((item) => item.cantidad > 0),
    );
  };

  const removeFromCart = (repuestoId: number) => {
    setCart((prev) => prev.filter((item) => item.repuesto.id !== repuestoId));
  };

  const subtotalTotal = cart.reduce((acc, item) => acc + item.cantidad * item.precioUnitario, 0);
  const totalFinal = Math.max(0, subtotalTotal - descuento);

  const createOrderMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        placa,
        marca,
        modelo,
        clienteNombre,
        clienteTelefono,
        descripcionFalla,
        descuento: Number(descuento),
        detalles: cart.map((item) => ({
          repuestoId: item.repuesto.id,
          cantidad: item.cantidad,
          precioUnitario: item.precioUnitario,
        })),
      };
      const res = await api.post('/ordenes', payload);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['repuestos-catalog'] });
      queryClient.invalidateQueries({ queryKey: ['inventario-stock'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });

      Swal.fire({
        icon: 'success',
        title: 'Orden registrada',
        text: `Comprobante ${data.codigoOrden} generado satisfactoriamente.`,
        timer: 1600,
        showConfirmButton: false,
      });

      setCreatedOrden(data);
      setCart([]);
      setPlaca('');
      setMarca('');
      setModelo('');
      setClienteNombre('');
      setClienteTelefono('');
      setDescripcionFalla('');
      setDescuento(0);
    },
    onError: (err: any) => {
      Swal.fire({
        icon: 'error',
        title: 'No se pudo emitir la orden',
        text: err.response?.data?.message || 'Verifique que las cantidades no superen el stock disponible.',
      });
    },
  });

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      Swal.fire({ icon: 'warning', title: 'Orden vacía', text: 'Debe agregar al menos un repuesto para procesar la orden.' });
      return;
    }
    if (!placa || !marca || !modelo || !clienteNombre) {
      Swal.fire({ icon: 'warning', title: 'Datos incompletos', text: 'Por favor ingrese la placa, marca, modelo y nombre del cliente.' });
      return;
    }
    createOrderMutation.mutate();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="pb-2 border-b border-slate-800/60">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Facturación y Órdenes de Trabajo</h1>
        <p className="text-xs text-slate-400 mt-0.5">Emisión de órdenes, asignación de repuestos con salida automática de inventario</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-[#111726] border border-slate-800 rounded-xl p-5 shadow-sm space-y-3.5">
            <div className="flex items-center space-x-2 text-sm font-semibold text-slate-200 pb-2 border-b border-slate-800">
              <Car className="w-4 h-4 text-amber-400" />
              <span>Identificación del Vehículo y Cliente</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Placa del Vehículo *</label>
                <input
                  type="text"
                  placeholder="Ej: P-234567"
                  value={placa}
                  onChange={(e) => setPlaca(e.target.value)}
                  className="w-full bg-[#182032] border border-slate-700/80 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 font-mono uppercase"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Marca *</label>
                <input
                  type="text"
                  placeholder="Ej: Toyota"
                  value={marca}
                  onChange={(e) => setMarca(e.target.value)}
                  className="w-full bg-[#182032] border border-slate-700/80 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Modelo y Año *</label>
                <input
                  type="text"
                  placeholder="Ej: Corolla 2021"
                  value={modelo}
                  onChange={(e) => setModelo(e.target.value)}
                  className="w-full bg-[#182032] border border-slate-700/80 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Propietario / Cliente *</label>
                <input
                  type="text"
                  placeholder="Nombre completo"
                  value={clienteNombre}
                  onChange={(e) => setClienteNombre(e.target.value)}
                  className="w-full bg-[#182032] border border-slate-700/80 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Teléfono de Contacto</label>
                <input
                  type="text"
                  placeholder="Ej: 7788-9900"
                  value={clienteTelefono}
                  onChange={(e) => setClienteTelefono(e.target.value)}
                  className="w-full bg-[#182032] border border-slate-700/80 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                />
              </div>
            </div>

            <div className="text-xs">
              <label className="block text-slate-300 font-medium mb-1">Detalle de Trabajo o Servicio Realizado</label>
              <textarea
                placeholder="Ej: Mantenimiento preventivo, cambio de aceite 10W-30 y filtro de motor..."
                value={descripcionFalla}
                onChange={(e) => setDescripcionFalla(e.target.value)}
                rows={2}
                className="w-full bg-[#182032] border border-slate-700/80 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
              />
            </div>
          </div>

          <div className="bg-[#111726] border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex items-center space-x-2 text-sm font-semibold text-slate-200">
                <Wrench className="w-4 h-4 text-amber-400" />
                <span>Catálogo de Repuestos Disponibles</span>
              </div>

              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Buscar repuesto..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-[#182032] border border-slate-700/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                />
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500 pointer-events-none" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
              {isLoading ? (
                <div className="col-span-2 text-center py-8 text-slate-500 text-xs">Cargando catálogo...</div>
              ) : repuestos && repuestos.length > 0 ? (
                repuestos.map((item) => (
                  <div
                    key={item.id}
                    className="bg-[#182032] border border-slate-800 hover:border-slate-700 rounded-lg p-3 flex items-center justify-between transition-all"
                  >
                    <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                      <div className="w-9 h-9 rounded bg-[#111726] border border-slate-700/80 flex items-center justify-center shrink-0 overflow-hidden">
                        {item.imagenUrl ? (
                          <img src={item.imagenUrl} alt={item.nombre} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="font-mono text-[10px] text-amber-400 font-semibold block leading-tight">
                          {item.codigo}
                        </span>
                        <h4 className="font-medium text-xs text-slate-100 truncate mt-0.5">
                          {item.nombre}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] font-mono font-bold text-slate-200">
                            ${Number(item.precioFinal).toFixed(2)}
                          </span>
                          <span className={`text-[10px] font-mono font-medium ${item.stockActual <= item.stockMinimo ? 'text-amber-400' : 'text-slate-400'}`}>
                            Stock: {item.stockActual}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => addToCart(item)}
                      disabled={item.stockActual <= 0}
                      className="bg-amber-500 hover:bg-amber-600 active:bg-amber-700 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-bold text-xs px-2.5 py-1.5 rounded-md flex items-center space-x-1 shrink-0 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Agregar</span>
                    </button>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center py-8 text-slate-500 text-xs">
                  No se encontraron repuestos con los criterios de búsqueda.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-[#111726] border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2 text-sm font-semibold text-slate-200">
                <ShoppingCart className="w-4 h-4 text-amber-400" />
                <span>Detalle de Orden</span>
              </div>
              <span className="text-[11px] bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded font-semibold border border-slate-700">
                {cart.length} {cart.length === 1 ? 'línea' : 'líneas'}
              </span>
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {cart.length > 0 ? (
                cart.map((item) => (
                  <div
                    key={item.repuesto.id}
                    className="bg-[#182032] p-2.5 rounded-lg border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex-1 pr-2 truncate">
                      <p className="font-medium text-slate-200 truncate">{item.repuesto.nombre}</p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        ${Number(item.precioUnitario).toFixed(2)} × {item.cantidad} ={' '}
                        <span className="text-slate-200 font-semibold">${(item.precioUnitario * item.cantidad).toFixed(2)}</span>
                      </p>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => updateQuantity(item.repuesto.id, -1)}
                        className="w-5 h-5 bg-[#111726] hover:bg-slate-700 text-slate-300 rounded flex items-center justify-center cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-mono font-bold text-xs px-1.5 text-white">{item.cantidad}</span>
                      <button
                        onClick={() => updateQuantity(item.repuesto.id, 1)}
                        className="w-5 h-5 bg-[#111726] hover:bg-slate-700 text-slate-300 rounded flex items-center justify-center cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.repuesto.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 ml-1 cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-slate-500 text-xs">
                  <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-30 text-slate-400" />
                  Seleccione artículos del catálogo para agregarlos a la orden.
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-slate-800 pt-3 space-y-2.5">
            <div className="flex justify-between text-xs text-slate-400 font-mono">
              <span>Subtotal:</span>
              <span className="text-slate-200 font-semibold">${subtotalTotal.toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Descuento aplicado:</span>
              <div className="flex items-center space-x-1">
                <span className="text-slate-500">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={descuento}
                  onChange={(e) => setDescuento(parseFloat(e.target.value) || 0)}
                  className="w-20 bg-[#182032] border border-slate-700 rounded px-2 py-1 text-right text-amber-400 font-mono font-semibold text-xs focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-between text-sm font-bold text-white border-t border-slate-800 pt-2 font-mono">
              <span>Total a cobrar:</span>
              <span className="text-base text-amber-400">${totalFinal.toFixed(2)}</span>
            </div>

            <button
              onClick={handleSubmitOrder}
              disabled={createOrderMutation.isPending || cart.length === 0}
              className="w-full bg-amber-500 hover:bg-amber-600 active:bg-amber-700 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-bold py-2.5 px-4 rounded-lg flex items-center justify-center space-x-2 transition-all cursor-pointer text-xs"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{createOrderMutation.isPending ? 'Procesando orden...' : 'Registrar Orden y Facturar'}</span>
            </button>
          </div>
        </div>
      </div>

      <ReceiptModal orden={createdOrden} onClose={() => setCreatedOrden(null)} />
    </div>
  );
};
