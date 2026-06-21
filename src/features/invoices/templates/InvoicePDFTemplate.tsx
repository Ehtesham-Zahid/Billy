import React from "react";
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";

interface InvoicePDFProps {
  invoice: any;
}

export const InvoicePDFTemplate: React.FC<InvoicePDFProps> = ({ invoice }) => {
  const template = invoice.templateId || {};
  const primaryColor = template.primaryColor || "#4F46E5";
  const layoutType = template.layoutType || "default";
  const company = invoice.companyId || {};

  const issueDateFormatted = new Date(invoice.issueDate).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const dueDateFormatted = new Date(invoice.dueDate).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Dynamic Stylesheet
  const styles = StyleSheet.create({
    page: {
      padding: 40,
      fontSize: 10,
      fontFamily: "Helvetica",
      color: "#18181B", // zinc-900
      backgroundColor: "#FFFFFF",
    },
    // LAYOUT SPECIALS
    headerContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      borderBottomWidth: layoutType === "minimal" ? 0 : 2,
      borderBottomColor: layoutType === "modern" ? primaryColor : "#E4E4E7",
      paddingBottom: 20,
      marginBottom: 20,
      backgroundColor: layoutType === "modern" ? "#FAF8FF" : "transparent", // modern top accent tint
      padding: layoutType === "modern" ? 15 : 0,
      borderRadius: layoutType === "modern" ? 6 : 0,
    },
    logo: {
      width: 50,
      height: 50,
      objectFit: "contain",
      marginRight: 10,
    },
    companyName: {
      fontSize: 16,
      fontWeight: "bold",
      color: layoutType === "minimal" ? "#18181B" : primaryColor,
    },
    companyDetails: {
      fontSize: 8,
      color: "#71717A", // zinc-500
      marginTop: 4,
      lineHeight: 1.4,
    },
    titleBlock: {
      alignItems: "flex-end",
    },
    title: {
      fontSize: 22,
      fontWeight: "bold",
      color: layoutType === "minimal" ? "#18181B" : primaryColor,
    },
    invoiceNumber: {
      marginTop: 4,
      fontSize: 11,
      fontFamily: "Courier",
      color: "#18181B",
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 8,
    },
    col: {
      width: "48%",
    },
    heading: {
      fontSize: 8,
      color: "#71717A",
      textTransform: "uppercase",
      fontWeight: "bold",
      marginBottom: 4,
      borderBottomWidth: layoutType === "minimal" ? 1 : 0,
      borderBottomColor: "#E4E4E7",
      paddingBottom: layoutType === "minimal" ? 2 : 0,
    },
    bodyText: {
      fontSize: 9,
      lineHeight: 1.4,
    },
    table: {
      marginTop: 20,
      borderWidth: layoutType === "minimal" ? 0 : 1,
      borderColor: "#E4E4E7",
      borderRadius: layoutType === "minimal" ? 0 : 4,
      overflow: "hidden",
    },
    tableHeader: {
      flexDirection: "row",
      backgroundColor: layoutType === "modern" ? primaryColor : layoutType === "minimal" ? "transparent" : "#F4F4F5",
      borderBottomWidth: 1,
      borderBottomColor: "#E4E4E7",
      padding: 8,
    },
    tableHeaderCell: {
      fontSize: 8,
      fontWeight: "bold",
      color: layoutType === "modern" ? "#FFFFFF" : "#71717A",
    },
    tableRow: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: "#E4E4E7",
      padding: 8,
    },
    descCol: { width: "50%" },
    qtyCol: { width: "15%", textAlign: "center" },
    priceCol: { width: "15%", textAlign: "right" },
    totalCol: { width: "20%", textAlign: "right" },
    monoText: {
      fontFamily: "Courier",
    },
    summaryBlock: {
      flexDirection: "row",
      justifyContent: "flex-end",
      marginTop: 20,
    },
    summaryTable: {
      width: "40%",
    },
    summaryRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 4,
      paddingVertical: 2,
    },
    totalRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      borderTopWidth: 1,
      borderTopColor: primaryColor,
      paddingTop: 8,
      marginTop: 4,
    },
    totalLabel: {
      fontSize: 11,
      fontWeight: "bold",
      color: layoutType === "minimal" ? "#18181B" : primaryColor,
    },
    totalValue: {
      fontSize: 11,
      fontWeight: "bold",
      fontFamily: "Courier",
      color: layoutType === "minimal" ? "#18181B" : primaryColor,
    },
    notesBlock: {
      marginTop: 30,
      borderTopWidth: 1,
      borderTopColor: "#E4E4E7",
      paddingTop: 15,
    },
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header Block */}
        <View style={styles.headerContainer}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {company.logoUrl ? (
              <Image src={company.logoUrl} style={styles.logo} />
            ) : null}
            <View>
              <Text style={styles.companyName}>{company.name || "BILLY PLATFORM"}</Text>
              <Text style={styles.companyDetails}>
                {company.address ? `${company.address}\n` : ""}
                {company.email ? `Email: ${company.email}` : ""}
                {company.phone ? ` | Phone: ${company.phone}` : ""}
                {company.taxId ? `\nTax ID: ${company.taxId}` : ""}
              </Text>
            </View>
          </View>
          <View style={styles.titleBlock}>
            <Text style={styles.title}>INVOICE</Text>
            <Text style={[styles.invoiceNumber, styles.monoText]}>{invoice.invoiceNumber}</Text>
          </View>
        </View>

        {/* Client & Date Details */}
        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.heading}>Bill To:</Text>
            <Text style={[styles.bodyText, { fontWeight: "bold" }]}>{invoice.clientSnapshot.name}</Text>
            <Text style={styles.bodyText}>{invoice.clientSnapshot.email}</Text>
            {invoice.clientSnapshot.phone && <Text style={styles.bodyText}>{invoice.clientSnapshot.phone}</Text>}
            {invoice.clientSnapshot.address && <Text style={styles.bodyText}>{invoice.clientSnapshot.address}</Text>}
            {invoice.clientSnapshot.taxId && <Text style={[styles.bodyText, styles.monoText, { fontSize: 8, marginTop: 4 }]}>Tax ID: {invoice.clientSnapshot.taxId}</Text>}
          </View>
          <View style={[styles.col, { alignItems: "flex-end" }]}>
            <View style={{ marginBottom: 6, alignItems: "flex-end" }}>
              <Text style={styles.heading}>Issue Date:</Text>
              <Text style={styles.bodyText}>{issueDateFormatted}</Text>
            </View>
            <View style={{ marginBottom: 6, alignItems: "flex-end" }}>
              <Text style={styles.heading}>Due Date:</Text>
              <Text style={styles.bodyText}>{dueDateFormatted}</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.heading}>Status:</Text>
              <Text style={{
                fontSize: 9,
                textTransform: "uppercase",
                fontWeight: "bold",
                color: invoice.status === "paid" ? "#10B981" : invoice.status === "sent" ? "#3B82F6" : invoice.status === "overdue" ? "#EF4444" : "#71717A"
              }}>
                {invoice.status}
              </Text>
            </View>
          </View>
        </View>

        {/* Table of Items */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.descCol, styles.tableHeaderCell]}>Description</Text>
            <Text style={[styles.qtyCol, styles.tableHeaderCell, { textAlign: "center" }]}>Qty</Text>
            <Text style={[styles.priceCol, styles.tableHeaderCell, { textAlign: "right" }]}>Price</Text>
            <Text style={[styles.totalCol, styles.tableHeaderCell, { textAlign: "right" }]}>Amount</Text>
          </View>

          {invoice.items.map((item: any, index: number) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.descCol}>{item.description}</Text>
              <Text style={[styles.qtyCol, styles.monoText, { textAlign: "center" }]}>{item.quantity}</Text>
              <Text style={[styles.priceCol, styles.monoText, { textAlign: "right" }]}>${item.price.toFixed(2)}</Text>
              <Text style={[styles.totalCol, styles.monoText, { textAlign: "right" }]}>${item.amount.toFixed(2)}</Text>
            </View>
          ))}
        </View>

        {/* Financial Summary */}
        <View style={styles.summaryBlock}>
          <View style={styles.summaryTable}>
            <View style={styles.summaryRow}>
              <Text style={styles.bodyText}>Subtotal</Text>
              <Text style={[styles.bodyText, styles.monoText]}>${invoice.subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.bodyText}>Tax ({invoice.taxRate}%)</Text>
              <Text style={[styles.bodyText, styles.monoText]}>${invoice.taxAmount.toFixed(2)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Due</Text>
              <Text style={styles.totalValue}>${invoice.total.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Notes */}
        {invoice.notes && (
          <View style={styles.notesBlock}>
            <Text style={styles.heading}>Notes & Terms:</Text>
            <Text style={styles.bodyText}>{invoice.notes}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
};
