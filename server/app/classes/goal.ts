export class Goal {
    id: number;
    name: string;
    points: number;
    isCompleted: boolean = false;
    isVerified: boolean = false;
    state: string = '';
    constructor(id: number, name: string, points: number) {
        this.id = id;
        this.name = name;
        this.points = points;
    }
}
