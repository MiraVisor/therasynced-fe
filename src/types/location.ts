/**
 * Location-related types
 */

export interface Location {
  id: string;
  name: string;
  address: string;
  type: 'OFFICE' | 'CLINIC';
  additionalFee: number;
  freelancerId: string;
  createdAt: string;
  updatedAt: string;
}
