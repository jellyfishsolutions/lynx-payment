import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import BaseEntity from 'lynx-framework/entities/base.entity';
import PaymentEntity from './payment.entity';
import { AdminUI, AdminField, AdminType } from 'lynx-admin-ui/decorators';
import EditableEntity from 'lynx-admin-ui/editable-entity';

@Entity('paymentmethods')
@AdminUI('Payment Methods')
export default class PaymentMethodEntity
    extends BaseEntity
    implements EditableEntity {
    @PrimaryGeneratedColumn()
    @AdminField({
        name: 'Id',
        type: AdminType.Id,
        onSummary: true,
        readOnly: true,
    })
    id: number;

    @Column()
    @AdminField({
        name: 'Name',
        type: AdminType.String,
        onSummary: true,
    })
    name: string;

    @OneToMany((type) => PaymentEntity, (payment) => payment.paymentMethod)
    payments: PaymentEntity[];

    getId() {
        return this.id;
    }
    getLabel(): string {
        return this.name;
    }
}
