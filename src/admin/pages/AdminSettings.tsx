import React, { useState } from 'react';
import { Button, Card, Field, Input, PageHeader } from '../components/ui';
import { useToast } from '../../components/ToastContext';

export default function AdminSettings(): React.ReactElement {
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  
  // Mock settings state - in real usage, fetch from an API
  const [settings, setSettings] = useState({
    siteName: 'HALU COFFEE',
    siteEmail: 'contact@halucafe.vn',
    sitePhone: '0988 123 456',
    siteAddress: '123 Đường Cà Phê, Quận 1, TP. Hồ Chí Minh',
    currency: 'VND',
    taxRate: '10',
    shippingFee: '20000',
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    // Simulate API call
    setTimeout(() => {
      setSaving(false);
      showToast('Đã lưu cài đặt hệ thống', 'success');
    }, 1000);
  };

  return (
    <div className="adminGrid">
      <div className="adminCol12">
        <PageHeader 
          title="Cài đặt hệ thống" 
          subtitle="Cấu hình thông tin cửa hàng, hiển thị và các thông số vận hành."
          right={
            <Button variant="primary" type="submit" form="settingsForm" disabled={saving}>
              {saving ? 'Đang lưu...' : 'Lưu tất cả'}
            </Button>
          }
        />
      </div>

      <div className="adminCol8">
        <Card>
          <form id="settingsForm" onSubmit={handleSave} style={{ display: 'grid', gap: '20px' }}>
            <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '15px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>Thông tin chung</h3>
              <p style={{ margin: '5px 0 0', fontSize: '13px', color: '#64748b' }}>Thông tin cơ bản về thương hiệu của bạn.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <Field label="Tên cửa hàng">
                <Input 
                  value={settings.siteName} 
                  onChange={e => setSettings({...settings, siteName: e.target.value})} 
                />
              </Field>
              <Field label="Email liên hệ">
                <Input 
                  value={settings.siteEmail} 
                  onChange={e => setSettings({...settings, siteEmail: e.target.value})} 
                />
              </Field>
            </div>

            <Field label="Số điện thoại hotline">
              <Input 
                value={settings.sitePhone} 
                onChange={e => setSettings({...settings, sitePhone: e.target.value})} 
              />
            </Field>

            <Field label="Địa chỉ cửa hàng">
              <textarea 
                value={settings.siteAddress} 
                onChange={e => setSettings({...settings, siteAddress: e.target.value})}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', minHeight: '80px', fontSize: '14px', outline: 'none' }}
              />
            </Field>

            <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '15px', marginTop: '10px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>Vận hành & Thuế</h3>
              <p style={{ margin: '5px 0 0', fontSize: '13px', color: '#64748b' }}>Cấu hình các thông số liên quan đến tiền tệ và đơn hàng.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
              <Field label="Tiền tệ">
                <Input value={settings.currency} readOnly disabled />
              </Field>
              <Field label="Thuế VAT (%)">
                <Input 
                  type="number" 
                  value={settings.taxRate} 
                  onChange={e => setSettings({...settings, taxRate: e.target.value})} 
                />
              </Field>
              <Field label="Phí ship mặc định">
                <Input 
                  type="number" 
                  value={settings.shippingFee} 
                  onChange={e => setSettings({...settings, shippingFee: e.target.value})} 
                />
              </Field>
            </div>
          </form>
        </Card>
      </div>

      <div className="adminCol4">
        <Card>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ textAlign: 'center', padding: '10px' }}>
              <div style={{ 
                width: '100px', height: '100px', backgroundColor: '#f1f5f9', 
                borderRadius: '12px', margin: '0 auto 15px', display: 'flex', 
                alignItems: 'center', justifyContent: 'center', fontSize: '32px'
              }}>
                ☕
              </div>
              <h4 style={{ margin: 0 }}>Logo Cửa Hàng</h4>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '5px 0 15px' }}>Dùng trên header website và hóa đơn.</p>
              <Button variant="ghost" size="sm" style={{ width: '100%' }}>Thay đổi logo</Button>
            </div>

            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
              <h4 style={{ margin: '0 0 10px', fontSize: '14px' }}>Bảo trì hệ thống</h4>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '15px' }}>Tắt website tạm thời để bảo trì.</p>
              <Button variant="danger" size="sm" style={{ width: '100%' }}>Bật chế độ bảo trì</Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
