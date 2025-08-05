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
   * Uses the current document ID from context or set via updateDocumentId()
   * @returns Promise<ContractEntityData | null> - The contract entity data or null if failed
   */
  async GetValidatedDocument(): Promise<ContractEntityData | null> {
    try {
      // Use manually set document ID first, then fall back to global context
      const documentId = this.currentDocumentId || getCurrentDocumentIdGlobal();
      
      if (!documentId) {
        console.error(`[LegalDataService] Cannot get validated document: no document ID available from context or manual setting.`);
        return null;
      }

      console.log(`[LegalDataService] Getting validated document with ID: ${documentId}`);
      
      const response = await flowRestService.callRPC('GetValidatedDocument', {
        documentId: documentId
      });
      
      console.log(`[LegalDataService] GetValidatedDocument response:`, response);
      
      if (response.success && response.data) {
        return response.data as ContractEntityData;
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
