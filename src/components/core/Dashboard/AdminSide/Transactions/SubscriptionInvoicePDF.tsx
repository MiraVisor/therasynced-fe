import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import { format } from 'date-fns';

import { InvoiceGenerationData } from './InvoiceGenerationService';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#2c3e50',
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 30,
    borderBottom: '3 solid #007745',
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  companyName: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: '#007745',
    marginBottom: 4,
  },
  invoiceTitle: {
    fontSize: 28,
    fontFamily: 'Helvetica-Bold',
    color: '#007745',
    textAlign: 'right',
  },
  invoiceNumber: {
    fontSize: 11,
    color: '#4a615b',
    textAlign: 'right',
    marginTop: 4,
  },
  invoiceDate: {
    fontSize: 10,
    color: '#4a615b',
    textAlign: 'right',
    marginTop: 2,
  },
  infoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  infoBlock: {
    width: '48%',
  },
  infoTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#007745',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoText: {
    fontSize: 10,
    color: '#2c3e50',
    marginBottom: 3,
    lineHeight: 1.4,
  },
  table: {
    marginTop: 20,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#007745',
    padding: 10,
    borderRadius: 4,
  },
  tableHeaderCell: {
    color: '#ffffff',
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1 solid #d6e5dd',
    padding: 12,
    backgroundColor: '#fcfcfc',
  },
  tableRowAlt: {
    flexDirection: 'row',
    borderBottom: '1 solid #d6e5dd',
    padding: 12,
    backgroundColor: '#ffffff',
  },
  tableCell: {
    fontSize: 10,
    color: '#2c3e50',
  },
  totalsSection: {
    marginTop: 20,
    alignItems: 'flex-end',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '40%',
    marginBottom: 8,
    paddingVertical: 4,
  },
  totalLabel: {
    fontSize: 10,
    color: '#2c3e50',
    fontFamily: 'Helvetica-Bold',
  },
  totalValue: {
    fontSize: 10,
    color: '#2c3e50',
    fontFamily: 'Helvetica-Bold',
  },
  grandTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '40%',
    marginTop: 10,
    paddingTop: 10,
    borderTop: '2 solid #007745',
  },
  grandTotalLabel: {
    fontSize: 12,
    color: '#007745',
    fontFamily: 'Helvetica-Bold',
  },
  grandTotalValue: {
    fontSize: 12,
    color: '#007745',
    fontFamily: 'Helvetica-Bold',
  },
  footer: {
    marginTop: 40,
    paddingTop: 20,
    borderTop: '1 solid #d6e5dd',
    fontSize: 8,
    color: '#7a8a85',
    textAlign: 'center',
  },
});

export const SubscriptionInvoicePDF = ({ data }: { data: InvoiceGenerationData }) => {
  const formatCurrency = (amount: number) => {
    return `€${amount.toFixed(2)}`;
  };

  const commissionPercentage = (
    (data.transaction.commission / data.transaction.amount) *
    100
  ).toFixed(1);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.companyName}>TheraSynced</Text>
              <Text style={styles.infoText}>Subscription Invoice</Text>
            </View>
            <View>
              <Text style={styles.invoiceTitle}>INVOICE</Text>
              <Text style={styles.invoiceNumber}>#{data.invoiceNumber}</Text>
              <Text style={styles.invoiceDate}>
                Date: {format(new Date(data.issueDate), 'MMM dd, yyyy')}
              </Text>
            </View>
          </View>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoBlock}>
            <Text style={styles.infoTitle}>Bill To</Text>
            <Text style={styles.infoText}>{data.transaction.freelancerName}</Text>
            <Text style={styles.infoText}>{data.transaction.freelancerEmail}</Text>
          </View>
          <View style={styles.infoBlock}>
            <Text style={styles.infoTitle}>Payment Information</Text>
            <Text style={styles.infoText}>Transaction ID: {data.transaction.transactionId}</Text>
            <Text style={styles.infoText}>
              Payment Method: {data.transaction.paymentMethod.toUpperCase()}
            </Text>
            <Text style={styles.infoText}>Status: {data.transaction.status.toUpperCase()}</Text>
          </View>
        </View>

        {/* Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, { width: '40%' }]}>Description</Text>
            <Text style={[styles.tableHeaderCell, { width: '20%', textAlign: 'right' }]}>
              Amount
            </Text>
            <Text style={[styles.tableHeaderCell, { width: '20%', textAlign: 'right' }]}>
              Commission
            </Text>
            <Text style={[styles.tableHeaderCell, { width: '20%', textAlign: 'right' }]}>
              Total
            </Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, { width: '40%' }]}>
              {data.transaction.planName} Plan Subscription
            </Text>
            <Text style={[styles.tableCell, { width: '20%', textAlign: 'right' }]}>
              {formatCurrency(data.transaction.amount)}
            </Text>
            <Text style={[styles.tableCell, { width: '20%', textAlign: 'right' }]}>
              -{formatCurrency(data.transaction.commission)} ({commissionPercentage}%)
            </Text>
            <Text style={[styles.tableCell, { width: '20%', textAlign: 'right' }]}>
              {formatCurrency(data.transaction.netRevenue)}
            </Text>
          </View>
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>{formatCurrency(data.transaction.amount)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Commission ({commissionPercentage}%):</Text>
            <Text style={styles.totalValue}>-{formatCurrency(data.transaction.commission)}</Text>
          </View>
          <View style={styles.grandTotal}>
            <Text style={styles.grandTotalLabel}>Net Revenue:</Text>
            <Text style={styles.grandTotalValue}>
              {formatCurrency(data.transaction.netRevenue)}
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Thank you for your business!</Text>
          <Text style={{ marginTop: 4 }}>
            This is an automated invoice generated by TheraSynced. For questions, please contact
            support.
          </Text>
        </View>
      </Page>
    </Document>
  );
};
