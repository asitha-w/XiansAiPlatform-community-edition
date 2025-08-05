import { flowRestService } from '../../services/flowRestService';
import type { ContractEntityData } from '../../types';
import { getCurrentDocumentIdGlobal } from '../../utils/documentUtils';

export class LegalDataService {
  private currentDocumentId?: string;

  /**
   * Update the current document ID
   * @param documentId - The document ID to use for requests
   */
  updateDocumentId(documentId?: string): void {
    console.log(`[LegalDataService] Updating document ID to: ${documentId}`);
    this.currentDocumentId = documentId;
  }

  /**
   * Get the current document ID
   * @returns The current document ID from manual setting or global context
   */
  getCurrentDocumentId(): string | null {
    return this.currentDocumentId || getCurrentDocumentIdGlobal();
  }
  /**
   * Retrieves a validated document from the backend
   * @param documentId - Optional document ID to use (overrides context)
   * @returns Promise<ContractEntityData | null> - The contract entity data or null if failed
   */
  async GetValidatedDocument(documentId?: string): Promise<ContractEntityData | null> {
    try {
      // Use parameter first, then manually set document ID, then fall back to global context
      const resolvedDocumentId = documentId || this.currentDocumentId || getCurrentDocumentIdGlobal();
      
      if (!resolvedDocumentId) {
        console.error(`[LegalDataService] Cannot get validated document: no document ID available from context or manual setting.`);
        return null;
      }

      console.log(`[LegalDataService] Getting validated document with ID: ${resolvedDocumentId}`);
      
      const response = await flowRestService.callRPC('GetValidatedDocument', {
        documentId: resolvedDocumentId
      });
      
      console.log(`[LegalDataService] GetValidatedDocument response:`, response);
      
      if (response.success && response.data) {
        // Extract the actual contract data from the nested response structure
        const responseData = response.data as { response: { data: { data: ContractEntityData } } };
        const contractData = responseData?.response?.data?.data;
        
        if (contractData) {
          console.log(`[LegalDataService] Successfully extracted contract data:`, contractData);
          return contractData as ContractEntityData;
        } else {
          console.error(`[LegalDataService] No contract data found in response structure:`, responseData);
          return null;
        }
      } else {
        console.error(`[LegalDataService] Failed to get validated document:`, response.error);
        return null;
      }
      
    } catch (error) {
      console.error(`[LegalDataService] Error getting validated document:`, error);
      return null;
    }
  }
}

// Export a singleton instance for convenience
export const legalDataService = new LegalDataService();
