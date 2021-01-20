import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import BaseEntity from 'lynx-framework/entities/base.entity';
import PaymentMethodEntity from './payment-method.entity';
import { AdminUI, AdminField, AdminType } from 'lynx-admin-ui/decorators';
import EditableEntity from 'lynx-admin-ui/editable-entity';

export enum Status {
    init = 'init',
    started = 'started',
    completed = 'completed',
    progress = 'progress',
    error = 'error',
    aborted = 'aborted',
}

function getStatuses() {
    return [
        {
            key: Status.init,
            value: 'Init',
        },
        {
            key: Status.started,
            value: 'Started',
        },
        {
            key: Status.completed,
            value: 'Completed',
        },
        {
            key: Status.progress,
            value: 'Progress',
        },
        {
            key: Status.error,
            value: 'Error',
        },
        {
            key: Status.aborted,
            value: 'Aborted',
        },
    ];
}

export enum Currency {
    eur = 'eur',
    usd = 'usd',
    gbp = 'gbp',
}

@Entity('payments')
@AdminUI('Payments', {
    disableCreation: true,
})
export default class PaymentEntity
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
        name: 'Uuid',
        type: AdminType.String,
        readOnly: true,
        onSummary: true,
    })
    uuid: string;

    @Column({ type: 'int' })
    @AdminField({
        name: 'Amount',
        type: AdminType.Number,
        readOnly: true,
        onSummary: true,
    })
    amount: number;

    @Column({ length: 3 })
    @AdminField({
        name: 'Currency',
        type: AdminType.String,
        readOnly: true,
        onSummary: true,
    })
    currency: string;

    @Column()
    @AdminField({
        name: 'Status',
        type: AdminType.Selection,
        values: getStatuses(),
        readOnly: true,
        onSummary: true,
    })
    status: Status;

    @Column({ type: 'text', nullable: true })
    _data: string;

    @Column({ type: 'text' })
    description: string;

    @Column({ type: 'text' })
    callback: string;

    @Column({ type: 'text' })
    layout: string;

    @ManyToOne((type) => PaymentMethodEntity, (method) => method.payments)
    @JoinColumn()
    paymentMethod: PaymentMethodEntity;

    getId() {
        return this.id;
    }
    getLabel(): string {
        return this.id + ' ' + this.amount + ' ' + this.currency;
    }

    getAmount() {
        return ((this.amount as number) / 100).toFixed(2);
    }

    getCurrencySymbol() {
        switch (this.currency) {
            case Currency.eur:
                return '€';
            case Currency.usd:
                return '$';
            case Currency.gbp:
                return '£';
        }
    }

    get data(): any {
        return JSON.parse(this._data);
    }

    set data(_data: any) {
        this._data = JSON.stringify(_data);
    }

    get currentUrl(): string {
        if (this.status == Status.init) {
            return 'checkout-view';
        }
        return '';
    }
}
