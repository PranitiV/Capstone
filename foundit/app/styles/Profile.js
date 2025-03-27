import { StyleSheet, Dimensions } from "react-native"

const { width } = Dimensions.get("window")

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
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
    backgroundColor: "#1E3765",
    borderRadius: 24,
    shadowColor: "#000000",
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
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 4,
    borderColor: "#ffffff",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cameraButton: {
    position: "absolute",
    right: 0,
    bottom: 0,
    backgroundColor: "#1E3765",
    borderRadius: 20,
    padding: 10,
    borderWidth: 3,
    borderColor: "#ffffff",
  },
  username: {
    fontSize: 26,
    fontWeight: "bold",
    marginTop: 12,
    color: "#1E3765",
  },
  infoCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 24,
    margin: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#1E3765",
  },
  infoItem: {
    marginBottom: 20,
  },
  infoLabel: {
    fontSize: 15,
    color: "#1E3765",
    marginBottom: 6,
    fontWeight: "600",
  },
  infoValue: {
    fontSize: 18,
    color: "#333333",
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
    color: "#1E3765",
  },
  itemCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 0.5,
    borderColor: "#1E3765",
  },
  itemTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 8,
  },
  itemLocationWrapper: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  itemLocation: {
    fontSize: 15,
    color: "#666666",
    marginLeft: 6,
    flex: 1,
  },
  loadingText: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#e74c3c",
    textAlign: "center",
    padding: 20,
  },
  emptyState: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 30,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  emptyStateText: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 24,
    lineHeight: 22,
  },
  createPostButton: {
    backgroundColor: "#1E3765",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 10,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  createPostButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 16,
  },

  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 0,
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    width: width * 0.95,
    maxWidth: width,
    shadowColor: "#000000",
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
    color: "#1E3765",
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
    color: "#1E3765",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    padding: 16,
    fontSize: 16,
    color: "#333333",
    backgroundColor: "#f8f9fa",
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
    color: "#666666",
    fontWeight: "500",
  },
  saveButton: {
    backgroundColor: "#1E3765",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  saveButtonText: {
    fontSize: 16,
    color: "#ffffff",
    fontWeight: "600",
  },

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
    color: "#333333",
    fontWeight: "500",
  },
  logoutButton: {
    borderBottomWidth: 0,
    marginTop: 12,
  },
  logoutButtonText: {
    color: "#e74c3c",
    fontSize: 17,
    flex: 1,
    fontWeight: "500",
  },
})










  
  
  