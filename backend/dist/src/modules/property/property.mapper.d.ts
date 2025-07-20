/**
 * Property Mapper
 * Maps between database models and DTOs
 */
import { Property } from '@prisma/client';
import { PropertyDTO } from './property.types';
/**
 * Maps a Property database model to a PropertyDTO
 * @param property The property database model
 * @returns The property DTO
 */
export declare function mapPropertyToDTO(property: Property): PropertyDTO;
/**
 * Maps an array of Property database models to PropertyDTOs
 * @param properties The array of property database models
 * @returns The array of property DTOs
 */
export declare function mapPropertiesToDTOs(properties: Property[]): PropertyDTO[];
//# sourceMappingURL=property.mapper.d.ts.map