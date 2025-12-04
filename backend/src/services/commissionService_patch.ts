  // Aplicar comisión (cambiar a APPLIED)
  async applyCommission(commissionId: string, appliedToInvoice?: string) {
    const commission = await prisma.commission.findUnique({
      where: { id: commissionId },
    });

    if (!commission) {
      throw new Error('Commission not found');
    }

    if (commission.status !== CommissionStatus.EARNED) {
      throw new Error('Commission must be EARNED to apply');
    }

    return await prisma.commission.update({
      where: { id: commissionId },
      data: {
        status: CommissionStatus.APPLIED,
        appliedDate: new Date(),
        appliedToInvoice,
      },
    });
  }

  // Actualizar comisión
  async updateCommission(commissionId: string, data: {
    amount?: number;
    status?: CommissionStatus;
    notes?: string;
  }) {
    return await prisma.commission.update({
      where: { id: commissionId },
      data,
    });
  }

  // Eliminar comisión
  async deleteCommission(commissionId: string) {
    return await prisma.commission.delete({
      where: { id: commissionId },
    });
  }
