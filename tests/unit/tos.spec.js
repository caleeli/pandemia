import { mount } from '@vue/test-utils';
import Pandemia from '@/components/mixins/Pandemia.js';
import actions from '@/components/mixins/Actions.js';

describe('Actions', () => {
    test('Prueba tos', () => {
        const component = mount({
            template: "<div></div>",
            mixins: [Pandemia, actions],
            data() {
                return {
                    map: {
                        attributes: buildArrayMap(0)
                    }

                };
            },
        }).vm;
        const action = {
            attributes: {
                level: 4,
                actions: "onRandomRadius(city=>city.infection+=0.01 + city.infection * action.level * 0.1, 5, 2)",
            }
        };
        const history = [];
        // Partida de 15 minutos
        const punto0 = Math.floor(component.map.attributes.cities.length * 0.2);
        component.map.attributes.cities[punto0].infection = 1;
        component
        for (let t = 1; t <= 60 * 15; t++) {
            component.selected.splice(0);
            component.handleActions(action);
            //history.push(component.map.attributes.cities[punto0].infection);
            history.push(component.infection);
        }
        chart(history);
    })
})

function chart(data, width = 100, height = 10) {
    const map = [];
    for (let i = 0; i < height; i++) map.push(".".repeat(width));
    const maxT = data.length;
    const maxY = Math.max(...data);
    const minY = Math.min(...data);
    map[height - 1] += maxY;
    map[0] += minY;
    data.forEach((row, t) => {
        let index = Math.floor(t / maxT * width);
        let y = Math.floor(row / maxY * (height - 1));
        let s = map[y];
        s = s.substr(0, index) + 'x' + s.substr(index + 1);
        map[y] = s;
    });
    console.log(map.reverse().join("\n"));
}

function buildArrayMap(infection, s = 4, width = 80, height = 40) {
    const cities = [];
    let total = 0;
    for (let x = 0; x < width; x += s) {
        for (let y = 0; y < height; y += s) {
            cities.push({
                x,
                y,
                value: 100,
                infection,
            });
            total += 100;
        }
    }
    return { total, cities };
}