import actionFeature from './actionFeature';

const selectors = {
    radius(radius, color = [208, 52, 77]) {
        this.click.r0 = radius;
        this.click.color = color;
        return true;
    },
    toggle(action) {
        action.automatic = !action.automatic;
        return false;
    },
    notSelectable() {
        return false;
    }
};

export default {
    methods: {
        // Agrega los tipos de cursores (selectors)
        ...actionFeature("selectPointer", "pointer", selectors, true),
    }
}
