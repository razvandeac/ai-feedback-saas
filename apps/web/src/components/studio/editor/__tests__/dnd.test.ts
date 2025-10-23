import { moveBlock, insertBlock } from '../dnd';
import { Block } from '@/src/lib/studio/blocks/types';

const mockBlocks: Block[] = [
  {
    id: '1',
    type: 'text',
    version: 1,
    data: { text: 'First', align: 'left' },
  },
  {
    id: '2',
    type: 'text',
    version: 1,
    data: { text: 'Second', align: 'left' },
  },
  {
    id: '3',
    type: 'text',
    version: 1,
    data: { text: 'Third', align: 'left' },
  },
];

describe('dnd utilities', () => {
  describe('moveBlock', () => {
    it('should move block from one position to another', () => {
      const result = moveBlock(mockBlocks, 0, 2);
      
      expect(result[0].id).toBe('2');
      expect(result[1].id).toBe('3');
      expect(result[2].id).toBe('1');
    });

    it('should handle moving to the same position', () => {
      const result = moveBlock(mockBlocks, 1, 1);
      
      expect(result).toEqual(mockBlocks);
    });

    it('should not mutate original array', () => {
      const original = [...mockBlocks];
      moveBlock(mockBlocks, 0, 2);
      
      expect(mockBlocks).toEqual(original);
    });
  });

  describe('insertBlock', () => {
    const newBlock: Block = {
      id: '4',
      type: 'text',
      version: 1,
      data: { text: 'New', align: 'left' },
    };

    it('should insert block at specified index', () => {
      const result = insertBlock(mockBlocks, 1, newBlock);
      
      expect(result).toHaveLength(4);
      expect(result[0].id).toBe('1');
      expect(result[1].id).toBe('4');
      expect(result[2].id).toBe('2');
      expect(result[3].id).toBe('3');
    });

    it('should insert at the beginning', () => {
      const result = insertBlock(mockBlocks, 0, newBlock);
      
      expect(result[0].id).toBe('4');
      expect(result[1].id).toBe('1');
    });

    it('should insert at the end', () => {
      const result = insertBlock(mockBlocks, 3, newBlock);
      
      expect(result[3].id).toBe('4');
    });

    it('should not mutate original array', () => {
      const original = [...mockBlocks];
      insertBlock(mockBlocks, 1, newBlock);
      
      expect(mockBlocks).toEqual(original);
    });
  });
});
