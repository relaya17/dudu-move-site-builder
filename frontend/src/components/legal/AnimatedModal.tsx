import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogProps } from '@/components/ui/dialog';

interface AnimatedModalProps extends DialogProps {
  children: React.ReactNode;
}

export const AnimatedModal = ({ children, ...props }: AnimatedModalProps) => {
  return (
    <Dialog {...props}>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30
          }}
        >
          <DialogContent className="overflow-hidden">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {children}
            </motion.div>
          </DialogContent>
        </motion.div>
      </AnimatePresence>
    </Dialog>
  );
};