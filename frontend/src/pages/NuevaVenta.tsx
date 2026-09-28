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
  User,
  Car,
  FileText
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

  // Datos del vehículo y cliente
  const [placa, setPlaca] = useState('');
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [clienteNombre, setClienteNombre] = useState('');
  const [clienteTelefono, setClienteTelefono] = useState('');
  const [descripcionFalla, setDescripcionFalla] = useState('');

  // Estado para modal de impresión
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
        title: 'Sin Stock',
        text: `El repuesto "${repuesto.nombre}" está agotado.`,
      });
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.repuesto.id === repuesto.id);
      if (existing) {
        if (existing.cantidad >= repuesto.stockActual) {
          Swal.fire({
            icon: 'info',
            title: 'Límite de Stock',
            text: `No puede agregar más de ${repuesto.stockActual} unidades en existencia.`,
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
                title: 'Límite de Stock',
                text: `Stock máximo disponible: ${item.repuesto.stockActual} un.`,
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
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });

      Swal.fire({
        icon: 'success',
        title: '¡Orden Emitida con Éxito!',
        text: `Comprobante ${data.codigoOrden} generado.`,
        timer: 1500,
        showConfirmButton: false,
      });

      setCreatedOrden(data);
      // Reset Form
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
        title: 'Error al emitir orden',
        text: err.response?.data?.message || 'Revise la conexión o datos ingresados',
      });
    },
  });

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      Swal.fire({ icon: 'error', title: 'Lista Vacía', text: 'Debe agregar al menos 1 repuesto a la orden' });
      return;
    }
    if (!placa || !marca || !modelo || !clienteNombre) {
      Swal.fire({ icon: 'warning', title: 'Campos requeridos', text: 'Por favor ingrese la placa, marca, modelo y cliente.' });
      return;
    }
    createOrderMutation.mutate();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#00C897]">Facturación / Nueva Orden</h1>
          <p className="text-xs sm:text-sm text-slate-400">Seleccione repuestos, registre los datos del vehículo y emita el comprobante</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Product Search Catalog & Vehicle Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Vehicle & Customer Form */}
          <div className="bg-[#141A29] border border-[#222D46] rounded-xl p-6 shadow-xl space-y-4">
            <h3 className="font-bold text-base text-[#FFB800] flex items-center space-x-2">
              <Car className="w-5 h-5" />
              <span>Datos del Vehículo y Cliente</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Placa *</label>
                <input
                  type="text"
                  placeholder="Ej: P-123456"
                  value={placa}
                  onChange={(e) => setPlaca(e.target.value)}
                  className="w-full bg-[#1B2237] border border-[#26314D] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00C897]"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Marca *</label>
                <input
                  type="text"
                  placeholder="Ej: Toyota"
                  value={marca}
                  onChange={(e) => setMarca(e.target.value)}
                  className="w-full bg-[#1B2237] border border-[#26314D] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00C897]"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Modelo *</label>
                <input
                  type="text"
                  placeholder="Ej: Corolla 2020"
                  value={modelo}
                  onChange={(e) => setModelo(e.target.value)}
                  className="w-full bg-[#1B2237] border border-[#26314D] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00C897]"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nombre del Cliente *</label>
                <input
                  type="text"
                  placeholder="Ej: Efrain Antonio"
                  value={clienteNombre}
                  onChange={(e) => setClienteNombre(e.target.value)}
                  className="w-full bg-[#1B2237] border border-[#26314D] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00C897]"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Teléfono Cliente</label>
                <input
                  type="text"
                  placeholder="Ej: 7788-9900"
                  value={clienteTelefono}
                  onChange={(e) => setClienteTelefono(e.target.value)}
                  className="w-full bg-[#1B2237] border border-[#26314D] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00C897]"
                />
              </div>
            </div>

            <div className="text-xs">
              <label className="block text-slate-300 font-semibold mb-1">Descripción del Trabajo / Falla</label>
              <textarea
                placeholder="Ej: Cambio de aceite sintético 5W-30 y filtro de aceite..."
                value={descripcionFalla}
                onChange={(e) => setDescripcionFalla(e.target.value)}
                rows={2}
                className="w-full bg-[#1B2237] border border-[#26314D] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00C897]"
              />
            </div>
          </div>

          {/* Product Catalog Search */}
          <div className="bg-[#141A29] border border-[#222D46] rounded-xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h3 className="font-bold text-base text-white flex items-center space-x-2">
                <Wrench className="w-5 h-5 text-[#FFB800]" />
                <span>Seleccionar Repuestos del Catálogo</span>
              </h3>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por código o nombre..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-[#1B2237] border border-[#26314D] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#FFB800]"
                />
              </div>
            </div>

            {/* Repuestos Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-96 overflow-y-auto pr-1">
              {isLoading ? (
                <div className="col-span-2 text-center py-8 text-slate-400 text-xs">Cargando catálogo...</div>
              ) : repuestos && repuestos.length > 0 ? (
                repuestos.map((item) => (
                  <div
                    key={item.id}
                    className="bg-[#1B2237] border border-[#222D46] hover:border-[#00C897]/50 rounded-lg p-3 flex justify-between items-center transition-all group"
                  >
                    <div>
                      <span className="text-[10px] font-bold text-[#FFB800] bg-[#141A29] px-2 py-0.5 rounded border border-[#FFB800]/20">
                        {item.codigo}
                      </span>
                      <h4 className="font-semibold text-xs text-white mt-1 group-hover:text-[#00C897] transition-colors">
                        {item.nombre}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Stock: <span className={item.stockActual <= item.stockMinimo ? 'text-red-400 font-bold' : 'text-emerald-400'}>{item.stockActual} un.</span>
                      </p>
                      <p className="text-sm font-extrabold text-white mt-1">
                        ${Number(item.precioFinal).toFixed(2)}
                      </p>
                    </div>

                    <button
                      onClick={() => addToCart(item)}
                      disabled={item.stockActual <= 0}
                      className="bg-[#00C897] hover:bg-[#00B084] disabled:bg-slate-700 text-slate-950 font-bold text-xs px-3 py-2 rounded-lg flex items-center space-x-1 transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Agregar</span>
                    </button>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center py-8 text-slate-500 text-xs">
                  No se encontraron repuestos con el criterio especificado.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Cart */}
        <div className="bg-[#141A29] border border-[#222D46] rounded-xl p-6 shadow-xl flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#222D46] pb-3">
              <h3 className="font-bold text-lg text-white flex items-center space-x-2">
                <ShoppingCart className="w-5 h-5 text-[#00C897]" />
                <span>Resumen de Orden</span>
              </h3>
              <span className="text-xs bg-[#1B2237] text-slate-300 px-2.5 py-1 rounded-full font-semibold border border-[#222D46]">
                {cart.length} items
              </span>
            </div>

            {/* Cart List */}
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {cart.length > 0 ? (
                cart.map((item) => (
                  <div
                    key={item.repuesto.id}
                    className="bg-[#1B2237] p-3 rounded-lg border border-[#222D46] flex items-center justify-between text-xs"
                  >
                    <div className="flex-1 pr-2">
                      <p className="font-bold text-white line-clamp-1">{item.repuesto.nombre}</p>
                      <p className="text-[11px] text-slate-400">
                        ${Number(item.precioUnitario).toFixed(2)} x {item.cantidad} ={' '}
                        <span className="text-emerald-400 font-bold">${(item.precioUnitario * item.cantidad).toFixed(2)}</span>
                      </p>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => updateQuantity(item.repuesto.id, -1)}
                        className="p-1 bg-[#141A29] hover:bg-[#26314D] text-slate-300 rounded cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-bold px-1.5 text-white">{item.cantidad}</span>
                      <button
                        onClick={() => updateQuantity(item.repuesto.id, 1)}
                        className="p-1 bg-[#141A29] hover:bg-[#26314D] text-slate-300 rounded cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.repuesto.id)}
                        className="p-1 text-red-400 hover:text-red-300 ml-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-slate-500 text-xs">
                  <ShoppingCart className="w-10 h-10 mx-auto mb-2 opacity-30 text-slate-400" />
                  No ha agregado ningún repuesto a la orden.
                </div>
              )}
            </div>
          </div>

          {/* Pricing Math & Submit */}
          <div className="border-t border-[#222D46] pt-4 space-y-3">
            <div className="flex justify-between text-xs text-slate-300">
              <span>Subtotal:</span>
              <span className="font-semibold text-white">${subtotalTotal.toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>Descuento ($):</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={descuento}
                onChange={(e) => setDescuento(parseFloat(e.target.value) || 0)}
                className="w-24 bg-[#1B2237] border border-[#26314D] rounded px-2 py-1 text-right text-amber-400 font-bold text-xs focus:outline-none"
              />
            </div>

            <div className="flex justify-between text-base font-extrabold text-[#FFB800] border-t border-[#222D46] pt-3">
              <span>TOTAL ORDEN:</span>
              <span>${totalFinal.toFixed(2)}</span>
            </div>

            <button
              onClick={handleSubmitOrder}
              disabled={createOrderMutation.isPending || cart.length === 0}
              className="w-full bg-[#00C897] hover:bg-[#00B084] disabled:bg-slate-700 text-slate-950 font-bold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 transition-all shadow-lg cursor-pointer"
            >
              <CheckCircle className="w-5 h-5" />
              <span>{createOrderMutation.isPending ? 'EMITIENDO...' : 'EMITIR ORDEN Y FACTURAR'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Printable Receipt Modal */}
      <ReceiptModal orden={createdOrden} onClose={() => setCreatedOrden(null)} />
    </div>
  );
};
