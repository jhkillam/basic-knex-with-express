
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('Cohorts').del()
    .then(function () {
      // Inserts seed entries
      return knex('Cohorts').insert([
        {
          title: '2019 June Houston Flex', 
          id: 1,
          slug: '2019-06-houston-flex', 
          isActive: true, 
          startDate: '2019-06-18', 
          endDate: '2020-01-07'
        },
        {
          title: '2018 September Houston Flex', 
          id: 2,
          slug: '2018-09-houston-flex', 
          isActive: false, 
          startDate: '2018-09-14', 
          endDate: '2019-04-02'
        },
        {
          title: '2019 September Houston Flex', 
          id: 3,
          slug: '2019-09-houston-flex', 
          isActive: true, 
          startDate: '2019-09-14', 
          endDate: '2020-04-02'
        }
      ]);
    });
};
