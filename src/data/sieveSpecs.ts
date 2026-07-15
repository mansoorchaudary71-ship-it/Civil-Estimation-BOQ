export interface SieveSpec {
  size: number;
  minPassing: number;
  maxPassing: number;
}

export interface Grading {
  name: string;
  sieves: SieveSpec[];
}

export interface Category {
  name: string;
  gradings: Grading[];
}

export const sieveSpecData: { categories: Category[] } = {
  categories: [
    {
      name: "IS 383 Fine Aggregate",
      gradings: [
        {
          name: "Zone I",
          sieves: [
            { size: 10, minPassing: 100, maxPassing: 100 },
            { size: 4.75, minPassing: 90, maxPassing: 100 },
            { size: 2.36, minPassing: 60, maxPassing: 95 },
            { size: 1.18, minPassing: 30, maxPassing: 70 },
            { size: 0.6, minPassing: 15, maxPassing: 34 },
            { size: 0.3, minPassing: 5, maxPassing: 20 },
            { size: 0.15, minPassing: 0, maxPassing: 10 },
          ],
        },
        {
          name: "Zone II",
          sieves: [
            { size: 10, minPassing: 100, maxPassing: 100 },
            { size: 4.75, minPassing: 90, maxPassing: 100 },
            { size: 2.36, minPassing: 75, maxPassing: 100 },
            { size: 1.18, minPassing: 55, maxPassing: 90 },
            { size: 0.6, minPassing: 35, maxPassing: 59 },
            { size: 0.3, minPassing: 8, maxPassing: 30 },
            { size: 0.15, minPassing: 0, maxPassing: 10 },
          ],
        },
        {
          name: "Zone III",
          sieves: [
            { size: 10, minPassing: 100, maxPassing: 100 },
            { size: 4.75, minPassing: 90, maxPassing: 100 },
            { size: 2.36, minPassing: 85, maxPassing: 100 },
            { size: 1.18, minPassing: 75, maxPassing: 100 },
            { size: 0.6, minPassing: 60, maxPassing: 79 },
            { size: 0.3, minPassing: 12, maxPassing: 40 },
            { size: 0.15, minPassing: 0, maxPassing: 10 },
          ],
        },
        {
          name: "Zone IV",
          sieves: [
            { size: 10, minPassing: 100, maxPassing: 100 },
            { size: 4.75, minPassing: 95, maxPassing: 100 },
            { size: 2.36, minPassing: 95, maxPassing: 100 },
            { size: 1.18, minPassing: 90, maxPassing: 100 },
            { size: 0.6, minPassing: 80, maxPassing: 100 },
            { size: 0.3, minPassing: 15, maxPassing: 50 },
            { size: 0.15, minPassing: 0, maxPassing: 15 },
          ],
        }
      ]
    },
    {
      name: "IS 383 Coarse Aggregate",
      gradings: [
        {
          name: "40 mm Graded",
          sieves: [
            { size: 80, minPassing: 100, maxPassing: 100 },
            { size: 40, minPassing: 95, maxPassing: 100 },
            { size: 20, minPassing: 30, maxPassing: 70 },
            { size: 10, minPassing: 10, maxPassing: 35 },
            { size: 4.75, minPassing: 0, maxPassing: 5 },
          ]
        },
        {
          name: "20 mm Graded",
          sieves: [
            { size: 40, minPassing: 100, maxPassing: 100 },
            { size: 20, minPassing: 95, maxPassing: 100 },
            { size: 10, minPassing: 25, maxPassing: 55 },
            { size: 4.75, minPassing: 0, maxPassing: 10 },
          ]
        },
        {
          name: "16 mm Graded",
          sieves: [
            { size: 20, minPassing: 100, maxPassing: 100 },
            { size: 16, minPassing: 90, maxPassing: 100 },
            { size: 10, minPassing: 30, maxPassing: 70 },
            { size: 4.75, minPassing: 0, maxPassing: 10 },
          ]
        },
        {
          name: "12.5 mm Graded",
          sieves: [
            { size: 16, minPassing: 100, maxPassing: 100 },
            { size: 12.5, minPassing: 90, maxPassing: 100 },
            { size: 10, minPassing: 40, maxPassing: 85 },
            { size: 4.75, minPassing: 0, maxPassing: 10 },
          ]
        },
        {
          name: "10 mm Graded",
          sieves: [
            { size: 12.5, minPassing: 100, maxPassing: 100 },
            { size: 10, minPassing: 85, maxPassing: 100 },
            { size: 4.75, minPassing: 0, maxPassing: 20 },
            { size: 2.36, minPassing: 0, maxPassing: 5 },
          ]
        }
      ]
    },
    {
      name: "ASTM C33",
      gradings: [
        {
          name: "Fine Aggregate",
          sieves: [
            { size: 9.5, minPassing: 100, maxPassing: 100 },
            { size: 4.75, minPassing: 95, maxPassing: 100 },
            { size: 2.36, minPassing: 80, maxPassing: 100 },
            { size: 1.18, minPassing: 50, maxPassing: 85 },
            { size: 0.6, minPassing: 25, maxPassing: 60 },
            { size: 0.3, minPassing: 5, maxPassing: 30 },
            { size: 0.15, minPassing: 0, maxPassing: 10 },
          ]
        },
        {
          name: "Size No. 57 (25mm to 4.75mm)",
          sieves: [
            { size: 37.5, minPassing: 100, maxPassing: 100 },
            { size: 25.0, minPassing: 95, maxPassing: 100 },
            { size: 12.5, minPassing: 25, maxPassing: 60 },
            { size: 4.75, minPassing: 0, maxPassing: 10 },
            { size: 2.36, minPassing: 0, maxPassing: 5 },
          ]
        },
        {
          name: "Size No. 67 (19mm to 4.75mm)",
          sieves: [
            { size: 25.0, minPassing: 100, maxPassing: 100 },
            { size: 19.0, minPassing: 90, maxPassing: 100 },
            { size: 9.5, minPassing: 20, maxPassing: 55 },
            { size: 4.75, minPassing: 0, maxPassing: 10 },
            { size: 2.36, minPassing: 0, maxPassing: 5 },
          ]
        }
      ]
    },
    {
       name: "WBM (Water Bound Macadam)",
       gradings: [
         {
           name: "Grading 1 (90 to 45 mm)",
           sieves: [
             { size: 125, minPassing: 100, maxPassing: 100 },
             { size: 90, minPassing: 90, maxPassing: 100 },
             { size: 63, minPassing: 25, maxPassing: 60 },
             { size: 45, minPassing: 0, maxPassing: 15 },
             { size: 22.4, minPassing: 0, maxPassing: 5 },
           ]
         },
         {
           name: "Grading 2 (63 to 45 mm)",
           sieves: [
             { size: 90, minPassing: 100, maxPassing: 100 },
             { size: 63, minPassing: 90, maxPassing: 100 },
             { size: 53, minPassing: 25, maxPassing: 75 },
             { size: 45, minPassing: 0, maxPassing: 15 },
             { size: 22.4, minPassing: 0, maxPassing: 5 },
           ]
         },
         {
           name: "Grading 3 (53 to 22.4 mm)",
           sieves: [
             { size: 63, minPassing: 100, maxPassing: 100 },
             { size: 53, minPassing: 95, maxPassing: 100 },
             { size: 45, minPassing: 65, maxPassing: 90 },
             { size: 22.4, minPassing: 0, maxPassing: 10 },
             { size: 11.2, minPassing: 0, maxPassing: 5 },
           ]
         }
       ]
    }
  ]
};
