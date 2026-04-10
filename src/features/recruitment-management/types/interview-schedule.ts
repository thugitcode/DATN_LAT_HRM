interface ActionDef {
    key: string;
    color?: 'primary' | 'danger' | 'default';
    variant?: 'solid' | 'bordered';
    icon?: React.ReactNode;
}

export interface ActionConfig {
    primary: ActionDef;
    secondary?: ActionDef[];
}