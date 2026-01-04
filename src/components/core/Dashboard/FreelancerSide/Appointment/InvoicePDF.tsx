import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import { format } from 'date-fns';

// Define styles
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
  logo: {
    width: 80,
    height: 80,
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
    backgroundColor: '#f9fdfb',
  },
  tableCell: {
    fontSize: 10,
    color: '#2c3e50',
  },
  descriptionCol: {
    width: '50%',
    paddingRight: 10,
  },
  dateCol: {
    width: '20%',
  },
  durationCol: {
    width: '15%',
    textAlign: 'center',
  },
  amountCol: {
    width: '15%',
    textAlign: 'right',
  },
  notesSection: {
    marginTop: 20,
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#e8f5e9',
    borderRadius: 4,
    borderLeft: '4 solid #007745',
  },
  notesTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#007745',
    marginBottom: 6,
  },
  notesText: {
    fontSize: 9,
    color: '#4a615b',
    lineHeight: 1.5,
  },
  totalsSection: {
    marginLeft: 'auto',
    width: '40%',
    marginTop: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  totalLabel: {
    fontSize: 10,
    color: '#4a615b',
  },
  totalValue: {
    fontSize: 10,
    color: '#2c3e50',
    fontFamily: 'Helvetica-Bold',
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#007745',
    borderRadius: 4,
    marginTop: 8,
  },
  grandTotalLabel: {
    fontSize: 12,
    color: '#ffffff',
    fontFamily: 'Helvetica-Bold',
  },
  grandTotalValue: {
    fontSize: 14,
    color: '#ffffff',
    fontFamily: 'Helvetica-Bold',
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 20,
    borderTop: '1 solid #d6e5dd',
  },
  footerText: {
    fontSize: 9,
    color: '#4a615b',
    textAlign: 'center',
    lineHeight: 1.5,
  },
  thankYou: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#007745',
    textAlign: 'center',
    marginTop: 30,
    marginBottom: 10,
  },
});

export interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  businessName: string;
  freelancerName: string;
  freelancerEmail: string;
  freelancerAddress?: string;
  userName: string;
  userEmail: string;
  appointmentDate: string;
  appointmentTime: string;
  duration: number;
  services: Array<{
    name: string;
    price: number;
  }>;
  basePrice: number;
  totalAmount: number;
  notes?: string;
  locationType: string;
  location?: string;
}

export const InvoicePDF = ({ data }: { data: InvoiceData }) => {
  const formatCurrency = (amount: number) => {
    return `€${amount.toFixed(2)}`;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${mins}m`;
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.companyName}>{data.businessName}</Text>
              <Text style={styles.infoText}>Professional Healthcare Services</Text>
            </View>
            <View>
              <Text style={styles.invoiceTitle}>INVOICE</Text>
              <Text style={styles.invoiceNumber}>#{data.invoiceNumber}</Text>
              <Text style={styles.invoiceDate}>
                Date: {format(new Date(data.invoiceDate), 'MMM dd, yyyy')}
              </Text>
            </View>
          </View>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          {/* From */}
          <View style={styles.infoBlock}>
            <Text style={styles.infoTitle}>From</Text>
            <Text style={[styles.infoText, { fontFamily: 'Helvetica-Bold' }]}>
              {data.freelancerName}
            </Text>
            <Text style={styles.infoText}>{data.freelancerEmail}</Text>
            {data.freelancerAddress && (
              <Text style={styles.infoText}>{data.freelancerAddress}</Text>
            )}
          </View>

          {/* To */}
          <View style={styles.infoBlock}>
            <Text style={styles.infoTitle}>Bill To</Text>
            <Text style={[styles.infoText, { fontFamily: 'Helvetica-Bold' }]}>{data.userName}</Text>
            <Text style={styles.infoText}>{data.userEmail}</Text>
          </View>
        </View>

        {/* Services Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.descriptionCol]}>Description</Text>
            <Text style={[styles.tableHeaderCell, styles.dateCol]}>Date</Text>
            <Text style={[styles.tableHeaderCell, styles.durationCol]}>Duration</Text>
            <Text style={[styles.tableHeaderCell, styles.amountCol]}>Amount</Text>
          </View>

          {/* Base Appointment */}
          <View style={styles.tableRow}>
            <View style={styles.descriptionCol}>
              <Text style={[styles.tableCell, { fontFamily: 'Helvetica-Bold' }]}>
                Therapy Session - {data.locationType}
              </Text>
              <Text style={[styles.tableCell, { fontSize: 9, color: '#4a615b', marginTop: 2 }]}>
                {data.appointmentTime}
              </Text>
              {data.location && (
                <Text style={[styles.tableCell, { fontSize: 8, color: '#4a615b', marginTop: 2 }]}>
                  Location: {data.location}
                </Text>
              )}
            </View>
            <Text style={[styles.tableCell, styles.dateCol]}>
              {format(new Date(data.appointmentDate), 'MMM dd, yyyy')}
            </Text>
            <Text style={[styles.tableCell, styles.durationCol]}>
              {formatDuration(data.duration)}
            </Text>
            <Text style={[styles.tableCell, styles.amountCol]}>
              {formatCurrency(data.basePrice)}
            </Text>
          </View>

          {/* Additional Services */}
          {data.services.map((service, index) => (
            <View key={index} style={index % 2 === 0 ? styles.tableRowAlt : styles.tableRow}>
              <View style={styles.descriptionCol}>
                <Text style={styles.tableCell}>{service.name}</Text>
                <Text style={[styles.tableCell, { fontSize: 9, color: '#4a615b', marginTop: 2 }]}>
                  Additional Service
                </Text>
              </View>
              <Text style={[styles.tableCell, styles.dateCol]}>
                {format(new Date(data.appointmentDate), 'MMM dd, yyyy')}
              </Text>
              <Text style={[styles.tableCell, styles.durationCol]}>-</Text>
              <Text style={[styles.tableCell, styles.amountCol]}>
                {formatCurrency(service.price)}
              </Text>
            </View>
          ))}
        </View>

        {/* Notes */}
        {data.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.notesTitle}>Session Notes</Text>
            <Text style={styles.notesText}>{data.notes}</Text>
          </View>
        )}

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>{formatCurrency(data.totalAmount)}</Text>
          </View>
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>Total Amount:</Text>
            <Text style={styles.grandTotalValue}>{formatCurrency(data.totalAmount)}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.thankYou}>Thank you for your trust!</Text>
          <Text style={styles.footerText}>
            This invoice was generated by TheraSyned - Professional Healthcare Platform
          </Text>
          <Text style={[styles.footerText, { marginTop: 5 }]}>
            For questions about this invoice, please contact {data.freelancerEmail}
          </Text>
        </View>
      </Page>
    </Document>
  );
};
