import { StyleSheet, Dimensions } from "react-native"

const { width } = Dimensions.get("window")

// Define colors
const colors = {
  primary: "#4F46E5", // New blue color
  primaryDark: "#4338CA",
  primaryLight: "#818CF8",
  secondary: "#f8f9fa",
  text: "#333333",
  textSecondary: "#666666",
  textLight: "#888888",
  border: "#e0e0e0",
  white: "#ffffff",
  error: "#e74c3c",
  background: "#ffffff",
  cardBackground: "#ffffff",
  shadow: "#000000",
}

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  iconButton: {
    padding: 12,
    marginLeft: 16,
    backgroundColor: colors.primary,
    borderRadius: 24,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileSection: {
    alignItems: "center",
    padding: 20,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 12,
  },
  avatar: {
    width: 150, // Increased from 130 to 150
    height: 150, // Increased from 130 to 150
    borderRadius: 75, // Half of width/height
    borderWidth: 4,
    borderColor: colors.white,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cameraButton: {
    position: "absolute",
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 10,
    borderWidth: 3,
    borderColor: colors.white,
  },
  username: {
    fontSize: 26,
    fontWeight: "bold",
    marginTop: 12,
    color: colors.primary,
  },
  infoCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 24,
    margin: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  infoItem: {
    marginBottom: 20,
  },
  infoLabel: {
    fontSize: 15,
    color: colors.primary,
    marginBottom: 6,
    fontWeight: "600",
  },
  infoValue: {
    fontSize: 18,
    color: colors.text,
    fontWeight: "500",
  },
  postedItemsSection: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
    color: colors.primary,
  },
  itemCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16, // Reduced from 18 to 16 to give more space for content
    marginBottom: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  itemTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 8,
  },
  itemLocationWrapper: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap", // Allow text to wrap if needed
  },
  itemLocation: {
    fontSize: 15,
    color: colors.textSecondary,
    marginLeft: 6,
    flex: 1, // Allow text to take available space
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    textAlign: "center",
    padding: 20,
  },
  emptyState: {
    alignItems: "center",
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 30,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 16,
    marginBottom: 24,
    lineHeight: 22,
  },
  createPostButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 10,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  createPostButtonText: {
    color: colors.white,
    fontWeight: "bold",
    fontSize: 16,
  },

  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 0, // Removed padding to allow modal to expand to full width
  },
  modalContent: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    width: width * 0.95, // 95% of screen width
    maxWidth: width, // Ensure it doesn't exceed screen width
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.primary,
  },
  modalBody: {
    padding: 24,
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.secondary,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginRight: 12,
  },
  cancelButtonText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  saveButtonText: {
    fontSize: 16,
    color: colors.white,
    fontWeight: "600",
  },

  // Settings styles
  settingsOptions: {
    padding: 12,
  },
  settingsButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  settingsIcon: {
    marginRight: 16,
  },
  settingsButtonText: {
    fontSize: 17,
    flex: 1,
    color: colors.text,
    fontWeight: "500",
  },
  logoutButton: {
    borderBottomWidth: 0,
    marginTop: 12,
  },
  logoutButtonText: {
    color: colors.error,
    fontSize: 17,
    flex: 1,
    fontWeight: "500",
  },
})








  