import React, { useState } from 'react';
import { usePrescriptions, useCreatePrescription, useDispensePrescription } from '../hooks/usePrescriptions';
import { useMedicines } from '../hooks/useMedicines';

const Prescription = () => {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // TanStack Query Hooks
  const { data: prescriptionsData = [], isLoading: loading } = usePrescriptions();
  const { data: medicinesData = [] } = useMedicines();

  const createPrescriptionMutation = useCreatePrescription();
  const dispensePrescriptionMutation = useDispensePrescription();

  const prescriptions = prescriptionsData;
  const medicines = medicinesData;

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDispenseModal, setShowDispenseModal] = useState(false);
  const [selectedRx, setSelectedRx] = useState(null);

  // New Prescription Form state
  const [doctorName, setDoctorName] = useState('');
  const [doctorRegNo, setDoctorRegNo] = useState('');
  const [clinicHospital, setClinicHospital] = useState('');
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([{ medicineId: '', medicineName: '', quantity: 10, dosage: '1 tablet daily', duration: '5 days' }]);

  // Dispense Form options & Discount Options
  const [isHomeDelivery, setIsHomeDelivery] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [discountType, setDiscountType] = useState('none'); // 'none', 'percentage', 'amount'
  const [discountValue, setDiscountValue] = useState('');

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    
    // Auto fill name if ID selected
    if (field === 'medicineId') {
      const med = medicines.find(m => m._id === value);
      if (med) {
        newItems[index]['medicineName'] = med.name;
      }
    }
    
    setItems(newItems);
  };

  const addItemRow = () => {
    setItems([...items, { medicineId: '', medicineName: '', quantity: 10, dosage: '1 tablet daily', duration: '5 days' }]);
  };

  const removeItemRow = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleAddPrescriptionSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate items
      for (let item of items) {
        if (!item.medicineName || !item.quantity) {
          alert('Please fill out all prescription medicine items.');
          return;
        }
      }

      const res = await createPrescriptionMutation.mutateAsync({
        doctorName, doctorRegNo, clinicHospital, patientName, patientPhone, notes,
        items: items.map(i => ({ ...i, quantity: Number(i.quantity) }))
      });

      if (res.success) {
        setMessage(`Doctor prescription logged successfully! Rx: ${res.data.prescriptionNo}`);
        setShowAddModal(false);
        // Reset fields
        setDoctorName(''); setDoctorRegNo(''); setClinicHospital(''); setPatientName(''); setPatientPhone(''); setNotes('');
        setItems([{ medicineId: '', medicineName: '', quantity: 10, dosage: '1 tablet daily', duration: '5 days' }]);
        setTimeout(() => setMessage(''), 4000);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDispenseClick = (rx) => {
    setSelectedRx(rx);
    setIsHomeDelivery(false);
    setDeliveryAddress('');
    setDiscountType('none');
    setDiscountValue('');
    setError('');
    setShowDispenseModal(true);
  };

  const calculateRxSubtotal = () => {
    if (!selectedRx || !selectedRx.items) return 0;
    return selectedRx.items.reduce((acc, item) => {
      const med = medicines.find(m => m._id === item.medicineId || m.name.toLowerCase() === item.medicineName.toLowerCase());
      const price = med ? med.sellingPrice : 0;
      return acc + (price * item.quantity);
    }, 0);
  };

  const rxSubtotal = calculateRxSubtotal();
  let calculatedDiscount = 0;
  if (discountType === 'percentage' && discountValue) {
    calculatedDiscount = Math.round(rxSubtotal * (Number(discountValue) / 100));
  } else if (discountType === 'amount' && discountValue) {
    calculatedDiscount = Math.min(rxSubtotal, Number(discountValue));
  }
  const estimatedTotal = Math.max(0, rxSubtotal - calculatedDiscount);

  const handleDispenseSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const res = await dispensePrescriptionMutation.mutateAsync({
        rxId: selectedRx._id,
        dispensePayload: {
          isHomeDelivery,
          deliveryAddress,
          discountType,
          discountValue: discountValue ? Number(discountValue) : 0
        }
      });
      if (res.success) {
        setMessage(res.message);
        setShowDispenseModal(false);
        setTimeout(() => setMessage(''), 4000);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: '32px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--text-main)', fontFamily: 'Outfit, sans-serif' }}>Doctor Prescriptions & Dispense Center</h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Validate, log and fulfill patient prescriptions with automated inventory stock-out & discounts</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-pos-checkout" style={{ width: 'auto', padding: '10px 20px', cursor: 'pointer' }}>
          <i className="fa-solid fa-file-signature" style={{ marginRight: '8px' }}></i> Log New Prescription
        </button>
      </div>

      {message && (
        <div style={{ background: 'var(--emerald-light)', border: '1px solid var(--emerald)', color: 'var(--emerald)', padding: '12px', borderRadius: 'var(--radius-sm)', marginBottom: '20px' }}>
          {message}
        </div>
      )}

      {/* Prescription Logs List */}
      <div style={{ background: 'var(--bg-surface)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', overflowX: 'auto' }}>
        <table className="inventory-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <th style={{ padding: '12px 10px' }}>Date Logged</th>
              <th style={{ padding: '12px 10px' }}>Rx Number</th>
              <th style={{ padding: '12px 10px' }}>Patient Details</th>
              <th style={{ padding: '12px 10px' }}>Doctor Specs</th>
              <th style={{ padding: '12px 10px' }}>Prescribed Drugs</th>
              <th style={{ padding: '12px 10px' }}>Status</th>
              <th style={{ padding: '12px 10px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                  <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '8px' }}></i> Loading prescriptions...
                </td>
              </tr>
            ) : prescriptions.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                  No logged prescriptions.
                </td>
              </tr>
            ) : (
              prescriptions.map((rx) => (
                <tr key={rx._id} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)', fontSize: '0.88rem' }}>
                  <td style={{ padding: '12px 10px', color: 'var(--text-dim)' }}>
                    {new Date(rx.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '12px 10px', color: 'var(--primary)', fontWeight: '600' }}>{rx.prescriptionNo}</td>
                  <td style={{ padding: '12px 10px' }}>
                    <div style={{ color: 'var(--text-main)', fontWeight: '500' }}>{rx.patientName}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{rx.patientPhone}</div>
                  </td>
                  <td style={{ padding: '12px 10px' }}>
                    <div style={{ color: 'var(--text-main)' }}>Dr. {rx.doctorName}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{rx.clinicHospital}</div>
                  </td>
                  <td style={{ padding: '12px 10px' }}>
                    {rx.items.map((item, index) => (
                      <div key={index} style={{ fontSize: '0.8rem', color: 'var(--text-main)' }}>
                        &bull; {item.medicineName} x {item.quantity} ({item.dosage} for {item.duration})
                      </div>
                    ))}
                  </td>
                  <td style={{ padding: '12px 10px' }}>
                    <span className={`badge ${rx.status === 'Dispensed' ? 'success' : rx.status === 'Pending' ? 'warning' : 'danger'}`}>
                      {rx.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                    {rx.status === 'Pending' && (
                      <button onClick={() => handleDispenseClick(rx)} className="btn-pos-checkout btn-emerald" style={{ width: 'auto', padding: '5px 12px', fontSize: '0.78rem', cursor: 'pointer' }}>
                        <i className="fa-solid fa-truck-ramp-box"></i> Dispense Rx
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', padding: '32px', borderRadius: 'var(--radius-lg)', width: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ color: 'var(--text-main)', fontSize: '1.2rem', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Log Doctor Patient Prescription</span>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}>&times;</button>
            </h3>

            <form onSubmit={handleAddPrescriptionSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div className="form-group">
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Doctor Name</label>
                  <input type="text" value={doctorName} onChange={(e) => setDoctorName(e.target.value)} required placeholder="Dr. Gregory Smith" style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.03)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)' }} />
                </div>
                <div className="form-group">
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Doctor Registry License No.</label>
                  <input type="text" value={doctorRegNo} onChange={(e) => setDoctorRegNo(e.target.value)} placeholder="DOC-REG-9941" style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.03)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)' }} />
                </div>
                <div className="form-group">
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Hospital / Clinic Location</label>
                  <input type="text" value={clinicHospital} onChange={(e) => setClinicHospital(e.target.value)} placeholder="City Health Care Clinic" style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.03)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)' }} />
                </div>
                <div className="form-group">
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Patient Full Name</label>
                  <input type="text" value={patientName} onChange={(e) => setPatientName(e.target.value)} required placeholder="Patient name" style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.03)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)' }} />
                </div>
                <div className="form-group">
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Patient Phone Number</label>
                  <input type="text" value={patientPhone} onChange={(e) => setPatientPhone(e.target.value)} required placeholder="+1 9876543210" style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.03)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)' }} />
                </div>
                <div className="form-group">
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Diagnosis / Notes</label>
                  <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional medical remarks..." style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.03)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)' }} />
                </div>
              </div>

              <h4 style={{ color: 'var(--text-main)', fontSize: '0.95rem', marginBottom: '12px' }}>Prescribed Drugs & Dosages</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                {items.map((item, index) => (
                  <div key={index} style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr 1.5fr 1fr 40px', gap: '10px', background: 'rgba(0,0,0,0.02)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                    <div>
                      <label style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Select Medicine</label>
                      <select value={item.medicineId} onChange={(e) => handleItemChange(index, 'medicineId', e.target.value)} required style={{ width: '100%', padding: '8px', background: 'rgba(0,0,0,0.03)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-main)' }}>
                        <option value="">-- Choose Med --</option>
                        {medicines.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Quantity</label>
                      <input type="number" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} required style={{ width: '100%', padding: '8px', background: 'rgba(0,0,0,0.03)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-main)' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Dosage Routine</label>
                      <input type="text" value={item.dosage} onChange={(e) => handleItemChange(index, 'dosage', e.target.value)} required placeholder="e.g. 1-0-1 after food" style={{ width: '100%', padding: '8px', background: 'rgba(0,0,0,0.03)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-main)' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Duration</label>
                      <input type="text" value={item.duration} onChange={(e) => handleItemChange(index, 'duration', e.target.value)} required placeholder="e.g. 5 days" style={{ width: '100%', padding: '8px', background: 'rgba(0,0,0,0.03)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-main)' }} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                      <button type="button" onClick={() => removeItemRow(index)} style={{ background: 'none', border: 'none', color: 'var(--rose)', cursor: 'pointer', fontSize: '1.2rem', paddingBottom: '8px' }}>
                        <i className="fa-solid fa-trash-can"></i>
                      </button>
                    </div>
                  </div>
                ))}
                <button type="button" onClick={addItemRow} className="badge info" style={{ alignSelf: 'flex-start', padding: '8px 16px', border: 'none', cursor: 'pointer' }}>
                  <i className="fa-solid fa-circle-plus"></i> Add Prescribed Med Row
                </button>
              </div>

              <button type="submit" className="btn-pos-checkout btn-emerald" style={{ width: '100%', padding: '12px', cursor: 'pointer' }}>
                Log Doctor Prescription
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Dispense Modal with Discount Options */}
      {showDispenseModal && selectedRx && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', padding: '32px', borderRadius: 'var(--radius-lg)', width: '560px' }}>
            <h3 style={{ color: 'var(--text-main)', fontSize: '1.2rem', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Dispense Prescription {selectedRx.prescriptionNo}</span>
              <button onClick={() => setShowDispenseModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}>&times;</button>
            </h3>

            {error && (
              <div style={{ background: 'var(--rose-light)', border: '1px solid var(--rose)', color: 'var(--rose)', padding: '10px', borderRadius: 'var(--radius-sm)', marginBottom: '16px', fontSize: '0.85rem' }}>
                {error}
              </div>
            )}

            <div style={{ marginBottom: '20px', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              <p>Patient Name: <strong style={{ color: 'var(--text-main)' }}>{selectedRx.patientName}</strong></p>
              <p>Doctor Specs: <strong style={{ color: 'var(--text-main)' }}>Dr. {selectedRx.doctorName}</strong> ({selectedRx.clinicHospital})</p>
            </div>

            <form onSubmit={handleDispenseSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Discount Options Container */}
              <div style={{ background: 'rgba(0, 0, 0, 0.03)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)' }}>
                    <i className="fa-solid fa-tags" style={{ marginRight: '6px', color: 'var(--primary)' }}></i> Prescription Discount Options
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Rx Subtotal: ₹{rxSubtotal.toFixed(2)}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Discount Type</label>
                    <select 
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value)}
                      style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.03)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)' }}
                    >
                      <option value="none">No Discount</option>
                      <option value="percentage">Percentage Discount (%)</option>
                      <option value="amount">Flat Rupee Amount (₹)</option>
                    </select>
                  </div>

                  {discountType !== 'none' && (
                    <div>
                      <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {discountType === 'percentage' ? 'Discount Percentage (%)' : 'Flat Discount Amount (₹)'}
                      </label>
                      <input 
                        type="number"
                        min="0"
                        step={discountType === 'percentage' ? '1' : '0.01'}
                        value={discountValue}
                        onChange={(e) => setDiscountValue(e.target.value)}
                        placeholder={discountType === 'percentage' ? 'e.g. 10' : 'e.g. 50'}
                        style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.03)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)' }}
                      />
                    </div>
                  )}
                </div>

                {/* Estimated Totals Summary */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid rgba(0,0,0,0.06)', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>
                    Discount Savings: <strong style={{ color: '#f59e0b' }}>-₹{calculatedDiscount.toFixed(2)}</strong>
                  </span>
                  <span style={{ color: 'var(--text-main)', fontWeight: '700', fontSize: '1rem' }}>
                    Net Bill: <strong style={{ color: '#10b981' }}>₹{estimatedTotal.toFixed(2)}</strong>
                  </span>
                </div>
              </div>

              {/* Delivery Option */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input 
                  type="checkbox" 
                  id="dispenseHomeDelivery" 
                  checked={isHomeDelivery}
                  onChange={(e) => setIsHomeDelivery(e.target.checked)}
                  style={{ transform: 'scale(1.2)' }} 
                />
                <label htmlFor="dispenseHomeDelivery" style={{ color: 'var(--text-main)', fontSize: '0.85rem', cursor: 'pointer' }}>Queue for Home Delivery shipping</label>
              </div>

              {isHomeDelivery && (
                <div className="form-group">
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Shipping Destination Address</label>
                  <input 
                    type="text" 
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Enter street delivery address" 
                    required
                    style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.03)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)' }} 
                  />
                </div>
              )}

              <button type="submit" className="btn-pos-checkout btn-emerald" style={{ width: '100%', padding: '12px', cursor: 'pointer', fontWeight: '700' }}>
                Process Auto Stock-Out & Dispense
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Prescription;
