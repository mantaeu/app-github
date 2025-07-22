import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { ThemedCard } from '../components/ThemedCard';
import { apiService } from '../services/api';

const { width } = Dimensions.get('window');

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface InvoiceData {
  type: 'devis' | 'facture';
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  items: InvoiceItem[];
  taxRate: number;
  discount: number;
  notes: string;
  dueDate: string;
}

export const InvoiceGeneratorScreen: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { user } = useAuth();
  
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    type: 'facture',
    clientName: '',
    clientEmail: '',
    clientAddress: '',
    items: [{ id: '1', description: '', quantity: 1, unitPrice: 0, total: 0 }],
    taxRate: 20, // Default 20% VAT
    discount: 0,
    notes: '',
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
  });
  
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await apiService.getUsers();
      if (response.success && response.data) {
        const userData = response.data.data || response.data;
        setUsers(Array.isArray(userData) ? userData : []);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0,
    };
    setInvoiceData(prev => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
  };

  const removeItem = (id: string) => {
    if (invoiceData.items.length > 1) {
      setInvoiceData(prev => ({
        ...prev,
        items: prev.items.filter(item => item.id !== id),
      }));
    }
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setInvoiceData(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          if (field === 'quantity' || field === 'unitPrice') {
            updatedItem.total = updatedItem.quantity * updatedItem.unitPrice;
          }
          return updatedItem;
        }
        return item;
      }),
    }));
  };

  const calculateSubtotal = () => {
    return invoiceData.items.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateDiscount = () => {
    return (calculateSubtotal() * invoiceData.discount) / 100;
  };

  const calculateTax = () => {
    const afterDiscount = calculateSubtotal() - calculateDiscount();
    return (afterDiscount * invoiceData.taxRate) / 100;
  };

  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscount() + calculateTax();
  };

  const generateInvoiceNumber = () => {
    const prefix = invoiceData.type === 'devis' ? 'DEV' : 'FAC';
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const time = String(date.getTime()).slice(-4);
    return `${prefix}-${year}${month}${day}-${time}`;
  };

  const generateHTMLContent = () => {
    const invoiceNumber = generateInvoiceNumber();
    const currentDate = new Date().toLocaleDateString('fr-FR');
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    const tax = calculateTax();
    const total = calculateTotal();

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>${invoiceData.type === 'devis' ? 'Devis' : 'Facture'} ${invoiceNumber}</title>
        <style>
            body {
                font-family: 'Helvetica', Arial, sans-serif;
                margin: 0;
                padding: 20px;
                color: #333;
                line-height: 1.6;
            }
            .header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 40px;
                border-bottom: 3px solid #3B82F6;
                padding-bottom: 20px;
            }
            .company-info {
                flex: 1;
            }
            .company-name {
                font-size: 28px;
                font-weight: bold;
                color: #3B82F6;
                margin-bottom: 10px;
            }
            .company-details {
                font-size: 14px;
                color: #666;
            }
            .invoice-info {
                text-align: right;
                flex: 1;
            }
            .invoice-title {
                font-size: 32px;
                font-weight: bold;
                color: #3B82F6;
                margin-bottom: 10px;
            }
            .invoice-number {
                font-size: 16px;
                color: #666;
                margin-bottom: 5px;
            }
            .invoice-date {
                font-size: 14px;
                color: #666;
            }
            .client-section {
                margin: 40px 0;
                background: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
            }
            .client-title {
                font-size: 18px;
                font-weight: bold;
                color: #3B82F6;
                margin-bottom: 15px;
            }
            .client-info {
                font-size: 14px;
                line-height: 1.8;
            }
            .items-table {
                width: 100%;
                border-collapse: collapse;
                margin: 30px 0;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                border-radius: 8px;
                overflow: hidden;
            }
            .items-table th {
                background: #3B82F6;
                color: white;
                padding: 15px 10px;
                text-align: left;
                font-weight: 600;
                font-size: 14px;
            }
            .items-table td {
                padding: 12px 10px;
                border-bottom: 1px solid #e5e7eb;
                font-size: 14px;
            }
            .items-table tr:nth-child(even) {
                background: #f8f9fa;
            }
            .items-table tr:hover {
                background: #e3f2fd;
            }
            .text-right {
                text-align: right;
            }
            .text-center {
                text-align: center;
            }
            .totals-section {
                margin-top: 30px;
                display: flex;
                justify-content: flex-end;
            }
            .totals-table {
                width: 300px;
                border-collapse: collapse;
            }
            .totals-table td {
                padding: 8px 15px;
                border-bottom: 1px solid #e5e7eb;
                font-size: 14px;
            }
            .totals-table .total-row {
                background: #3B82F6;
                color: white;
                font-weight: bold;
                font-size: 16px;
            }
            .notes-section {
                margin-top: 40px;
                padding: 20px;
                background: #f8f9fa;
                border-radius: 8px;
                border-left: 4px solid #3B82F6;
            }
            .notes-title {
                font-weight: bold;
                color: #3B82F6;
                margin-bottom: 10px;
            }
            .footer {
                margin-top: 50px;
                text-align: center;
                font-size: 12px;
                color: #666;
                border-top: 1px solid #e5e7eb;
                padding-top: 20px;
            }
            .due-date {
                margin-top: 20px;
                padding: 15px;
                background: #fff3cd;
                border: 1px solid #ffeaa7;
                border-radius: 8px;
                color: #856404;
                font-weight: 500;
            }
            @media print {
                body { margin: 0; }
                .no-print { display: none; }
            }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="company-info">
                <div class="company-name">MantaEvert</div>
                <div class="company-details">
                    Système de Gestion RH<br>
                    Email: contact@mantaevert.com<br>
                    Téléphone: +212 XXX XXX XXX
                </div>
            </div>
            <div class="invoice-info">
                <div class="invoice-title">${invoiceData.type === 'devis' ? 'DEVIS' : 'FACTURE'}</div>
                <div class="invoice-number">N° ${invoiceNumber}</div>
                <div class="invoice-date">Date: ${currentDate}</div>
                ${invoiceData.type === 'facture' && invoiceData.dueDate ? 
                  `<div class="invoice-date">Échéance: ${new Date(invoiceData.dueDate).toLocaleDateString('fr-FR')}</div>` : ''}
            </div>
        </div>

        <div class="client-section">
            <div class="client-title">Facturé à:</div>
            <div class="client-info">
                <strong>${invoiceData.clientName}</strong><br>
                ${invoiceData.clientEmail ? `Email: ${invoiceData.clientEmail}<br>` : ''}
                ${invoiceData.clientAddress ? invoiceData.clientAddress.replace(/\n/g, '<br>') : ''}
            </div>
        </div>

        <table class="items-table">
            <thead>
                <tr>
                    <th style="width: 50%">Description</th>
                    <th style="width: 15%" class="text-center">Quantité</th>
                    <th style="width: 20%" class="text-right">Prix Unitaire</th>
                    <th style="width: 15%" class="text-right">Total</th>
                </tr>
            </thead>
            <tbody>
                ${invoiceData.items.map(item => `
                    <tr>
                        <td>${item.description}</td>
                        <td class="text-center">${item.quantity}</td>
                        <td class="text-right">${item.unitPrice.toFixed(2)} DH</td>
                        <td class="text-right">${item.total.toFixed(2)} DH</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <div class="totals-section">
            <table class="totals-table">
                <tr>
                    <td>Sous-total:</td>
                    <td class="text-right">${subtotal.toFixed(2)} DH</td>
                </tr>
                ${discount > 0 ? `
                <tr>
                    <td>Remise (${invoiceData.discount}%):</td>
                    <td class="text-right">-${discount.toFixed(2)} DH</td>
                </tr>
                ` : ''}
                <tr>
                    <td>TVA (${invoiceData.taxRate}%):</td>
                    <td class="text-right">${tax.toFixed(2)} DH</td>
                </tr>
                <tr class="total-row">
                    <td><strong>TOTAL:</strong></td>
                    <td class="text-right"><strong>${total.toFixed(2)} DH</strong></td>
                </tr>
            </table>
        </div>

        ${invoiceData.type === 'facture' && invoiceData.dueDate ? `
        <div class="due-date">
            <strong>Date d'échéance:</strong> ${new Date(invoiceData.dueDate).toLocaleDateString('fr-FR')}
        </div>
        ` : ''}

        ${invoiceData.notes ? `
        <div class="notes-section">
            <div class="notes-title">Notes:</div>
            <div>${invoiceData.notes.replace(/\n/g, '<br>')}</div>
        </div>
        ` : ''}

        <div class="footer">
            <p>Généré par MantaEvert HR System - ${currentDate}</p>
            <p>${invoiceData.type === 'devis' ? 'Ce devis est valable 30 jours.' : 'Merci pour votre confiance!'}</p>
        </div>
    </body>
    </html>
    `;
  };

  const generatePDF = async () => {
    if (!invoiceData.clientName.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir le nom du client');
      return;
    }

    if (invoiceData.items.some(item => !item.description.trim())) {
      Alert.alert('Erreur', 'Veuillez remplir toutes les descriptions des articles');
      return;
    }

    setLoading(true);
    try {
      const htmlContent = generateHTMLContent();
      const invoiceNumber = generateInvoiceNumber();
      
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });

      // Create a more descriptive filename
      const fileName = `${invoiceData.type}_${invoiceNumber}_${invoiceData.clientName.replace(/\s+/g, '_')}.pdf`;
      const newPath = `${FileSystem.documentDirectory}${fileName}`;
      
      // Move the file to a permanent location
      await FileSystem.moveAsync({
        from: uri,
        to: newPath,
      });

      // Share the PDF
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(newPath, {
          mimeType: 'application/pdf',
          dialogTitle: `Partager ${invoiceData.type === 'devis' ? 'le devis' : 'la facture'}`,
        });
      }

      Alert.alert(
        'Succès',
        `${invoiceData.type === 'devis' ? 'Devis' : 'Facture'} généré${invoiceData.type === 'devis' ? '' : 'e'} avec succès!`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset form after successful generation
              setInvoiceData({
                type: 'facture',
                clientName: '',
                clientEmail: '',
                clientAddress: '',
                items: [{ id: '1', description: '', quantity: 1, unitPrice: 0, total: 0 }],
                taxRate: 20,
                discount: 0,
                notes: '',
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              });
            }
          }
        ]
      );

    } catch (error) {
      console.error('Error generating PDF:', error);
      Alert.alert('Erreur', 'Impossible de générer le PDF');
    } finally {
      setLoading(false);
    }
  };

  const selectUserAsClient = (selectedUser: any) => {
    setInvoiceData(prev => ({
      ...prev,
      clientName: selectedUser.name,
      clientEmail: selectedUser.email || '',
      clientAddress: selectedUser.address || '',
    }));
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Générateur de {invoiceData.type === 'devis' ? 'Devis' : 'Factures'}
        </Text>
        <Text style={[styles.subtitle, { color: colors.secondary }]}>
          Créez des devis et factures professionnels
        </Text>
      </View>

      {/* Document Type Selector */}
      <ThemedCard style={styles.card}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Type de document</Text>
        <View style={styles.typeSelector}>
          <TouchableOpacity
            style={[
              styles.typeButton,
              { backgroundColor: colors.border },
              invoiceData.type === 'devis' && { backgroundColor: colors.primary }
            ]}
            onPress={() => setInvoiceData(prev => ({ ...prev, type: 'devis' }))}
          >
            <Text style={[
              styles.typeButtonText,
              { color: colors.text },
              invoiceData.type === 'devis' && { color: '#FFFFFF' }
            ]}>
              Devis
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.typeButton,
              { backgroundColor: colors.border },
              invoiceData.type === 'facture' && { backgroundColor: colors.primary }
            ]}
            onPress={() => setInvoiceData(prev => ({ ...prev, type: 'facture' }))}
          >
            <Text style={[
              styles.typeButtonText,
              { color: colors.text },
              invoiceData.type === 'facture' && { color: '#FFFFFF' }
            ]}>
              Facture
            </Text>
          </TouchableOpacity>
        </View>
      </ThemedCard>

      {/* Client Information */}
      <ThemedCard style={styles.card}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Informations client</Text>
        
        {/* Quick select from users */}
        {users.length > 0 && (
          <View style={styles.quickSelectSection}>
            <Text style={[styles.quickSelectTitle, { color: colors.secondary }]}>
              Sélection rapide:
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.usersList}>
              {users.map((user) => (
                <TouchableOpacity
                  key={user._id}
                  style={[styles.userChip, { backgroundColor: colors.border }]}
                  onPress={() => selectUserAsClient(user)}
                >
                  <Text style={[styles.userChipText, { color: colors.text }]}>
                    {user.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <TextInput
          style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
          placeholder="Nom du client *"
          placeholderTextColor={colors.secondary}
          value={invoiceData.clientName}
          onChangeText={(text) => setInvoiceData(prev => ({ ...prev, clientName: text }))}
        />
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
          placeholder="Email du client"
          placeholderTextColor={colors.secondary}
          value={invoiceData.clientEmail}
          onChangeText={(text) => setInvoiceData(prev => ({ ...prev, clientEmail: text }))}
          keyboardType="email-address"
        />
        <TextInput
          style={[styles.textArea, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
          placeholder="Adresse du client"
          placeholderTextColor={colors.secondary}
          value={invoiceData.clientAddress}
          onChangeText={(text) => setInvoiceData(prev => ({ ...prev, clientAddress: text }))}
          multiline
          numberOfLines={3}
        />
      </ThemedCard>

      {/* Items */}
      <ThemedCard style={styles.card}>
        <View style={styles.itemsHeader}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Articles/Services</Text>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.primary }]}
            onPress={addItem}
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {invoiceData.items.map((item, index) => (
          <View key={item.id} style={styles.itemContainer}>
            <View style={styles.itemHeader}>
              <Text style={[styles.itemNumber, { color: colors.secondary }]}>
                Article {index + 1}
              </Text>
              {invoiceData.items.length > 1 && (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeItem(item.id)}
                >
                  <Ionicons name="trash-outline" size={16} color="#EF4444" />
                </TouchableOpacity>
              )}
            </View>
            
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
              placeholder="Description de l'article *"
              placeholderTextColor={colors.secondary}
              value={item.description}
              onChangeText={(text) => updateItem(item.id, 'description', text)}
            />
            
            <View style={styles.itemRow}>
              <TextInput
                style={[styles.smallInput, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                placeholder="Qté"
                placeholderTextColor={colors.secondary}
                value={item.quantity.toString()}
                onChangeText={(text) => updateItem(item.id, 'quantity', parseInt(text) || 0)}
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.smallInput, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                placeholder="Prix unitaire"
                placeholderTextColor={colors.secondary}
                value={item.unitPrice.toString()}
                onChangeText={(text) => updateItem(item.id, 'unitPrice', parseFloat(text) || 0)}
                keyboardType="numeric"
              />
              <View style={[styles.totalDisplay, { backgroundColor: colors.border }]}>
                <Text style={[styles.totalText, { color: colors.text }]}>
                  {item.total.toFixed(2)} DH
                </Text>
              </View>
            </View>
          </View>
        ))}
      </ThemedCard>

      {/* Calculations */}
      <ThemedCard style={styles.card}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Calculs</Text>
        
        <View style={styles.calculationRow}>
          <Text style={[styles.calculationLabel, { color: colors.secondary }]}>TVA (%):</Text>
          <TextInput
            style={[styles.calculationInput, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
            value={invoiceData.taxRate.toString()}
            onChangeText={(text) => setInvoiceData(prev => ({ ...prev, taxRate: parseFloat(text) || 0 }))}
            keyboardType="numeric"
          />
        </View>
        
        <View style={styles.calculationRow}>
          <Text style={[styles.calculationLabel, { color: colors.secondary }]}>Remise (%):</Text>
          <TextInput
            style={[styles.calculationInput, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
            value={invoiceData.discount.toString()}
            onChangeText={(text) => setInvoiceData(prev => ({ ...prev, discount: parseFloat(text) || 0 }))}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.totalsContainer}>
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: colors.secondary }]}>Sous-total:</Text>
            <Text style={[styles.totalValue, { color: colors.text }]}>
              {calculateSubtotal().toFixed(2)} DH
            </Text>
          </View>
          
          {invoiceData.discount > 0 && (
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: colors.secondary }]}>
                Remise ({invoiceData.discount}%):
              </Text>
              <Text style={[styles.totalValue, { color: '#EF4444' }]}>
                -{calculateDiscount().toFixed(2)} DH
              </Text>
            </View>
          )}
          
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: colors.secondary }]}>
              TVA ({invoiceData.taxRate}%):
            </Text>
            <Text style={[styles.totalValue, { color: colors.text }]}>
              {calculateTax().toFixed(2)} DH
            </Text>
          </View>
          
          <View style={[styles.totalRow, styles.finalTotal]}>
            <Text style={[styles.finalTotalLabel, { color: colors.text }]}>TOTAL:</Text>
            <Text style={[styles.finalTotalValue, { color: colors.primary }]}>
              {calculateTotal().toFixed(2)} DH
            </Text>
          </View>
        </View>
      </ThemedCard>

      {/* Additional Information */}
      <ThemedCard style={styles.card}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Informations supplémentaires</Text>
        
        {invoiceData.type === 'facture' && (
          <View style={styles.dueDateContainer}>
            <Text style={[styles.dueDateLabel, { color: colors.secondary }]}>Date d'échéance:</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
              value={invoiceData.dueDate}
              onChangeText={(text) => setInvoiceData(prev => ({ ...prev, dueDate: text }))}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.secondary}
            />
          </View>
        )}
        
        <TextInput
          style={[styles.textArea, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
          placeholder="Notes ou conditions particulières"
          placeholderTextColor={colors.secondary}
          value={invoiceData.notes}
          onChangeText={(text) => setInvoiceData(prev => ({ ...prev, notes: text }))}
          multiline
          numberOfLines={4}
        />
      </ThemedCard>

      {/* Generate Button */}
      <TouchableOpacity
        style={[styles.generateButton, { backgroundColor: colors.primary }]}
        onPress={generatePDF}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <>
            <Ionicons name="document-text-outline" size={24} color="#FFFFFF" />
            <Text style={styles.generateButtonText}>
              Générer {invoiceData.type === 'devis' ? 'le Devis' : 'la Facture'} PDF
            </Text>
          </>
        )}
      </TouchableOpacity>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.8,
  },
  card: {
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  typeSelector: {
    flexDirection: 'row',
    borderRadius: 12,
    overflow: 'hidden',
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  quickSelectSection: {
    marginBottom: 16,
  },
  quickSelectTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  usersList: {
    flexDirection: 'row',
  },
  userChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  userChipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
    textAlignVertical: 'top',
  },
  itemsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemContainer: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemNumber: {
    fontSize: 14,
    fontWeight: '500',
  },
  removeButton: {
    padding: 4,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  smallInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
  totalDisplay: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  totalText: {
    fontSize: 14,
    fontWeight: '600',
  },
  calculationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  calculationLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  calculationInput: {
    width: 80,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    textAlign: 'center',
  },
  totalsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  finalTotal: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: '#3B82F6',
  },
  finalTotalLabel: {
    fontSize: 18,
    fontWeight: '700',
  },
  finalTotalValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  dueDateContainer: {
    marginBottom: 16,
  },
  dueDateLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 20,
  },
});