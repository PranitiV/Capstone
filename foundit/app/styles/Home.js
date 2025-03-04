import { StyleSheet } from 'react-native'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  // Search wrapper for animation
  searchWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 10,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  // Results container
  resultsContainer: {
    flex: 1,
    marginTop: 150, // Space for the search bar when it moves to top
  },
  // New header styling to match the design
  newHeader: {
    paddingBottom: 20,
    alignItems: 'center',
  },
  newHeaderTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
  },
  // New search styling
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    width: '100%',
    backgroundColor: 'transparent',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    paddingHorizontal: 15,
    marginRight: 10,
    height: 50,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    marginRight: 10,
  },
  newSearchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#1F2937',
  },
  searchButton: {
    backgroundColor: '#1F2937',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    height: 50,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  // Filter chips
  filtersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
    width: '100%',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    marginBottom: 10,
  },
  filterText: {
    fontSize: 14,
    color: '#4B5563',
    marginRight: 8,
  },
  // Original styles preserved
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
  },
  imagePlaceholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  image: {
    width: '100%',
    height: 200,
  },
  hiddenImage: {
    opacity: 0,
  },
  cardContent: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  badge: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  lostBadge: {
    backgroundColor: '#FFD700',
  },
  foundBadge: {
    backgroundColor: '#90EE90',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
  },
  reportContainer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 30,
    paddingLeft: 16,
    paddingRight: 4,
    paddingVertical: 8,
  },
  reportText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4F46E5',
    marginRight: 8,
  },
  reportButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 30,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 150,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#3b3b3b',
  },
  // Profile button in top right
  profileButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 20, // Increased to be above searchWrapper
    backgroundColor: '#4F46E5',
    borderRadius: 30,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});

export default styles;