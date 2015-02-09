


<h2><a name="data-modelling">6. Aggregating on event-strams: data modelling</a></h2>

Snowplow delivers your entire event stream into your data warehouse.

It is possible to run queries against the entire event stream in Snowplow. In practice, however, it is very common to aggregate the data into a set of shorter tables (with fewer rows then the events table) to support querying. Part of this data modelling exercise involves applying business-specific logic and rules to the underlying data, for example:

1. Figuring out how to combine different events captured against different user identifiers (cookie IDs, login credentials) and combine them into a finite set of records that summarize who that user is
2. Combining multiple micro events into macro events that summarize e.g. how far a user has progressed through a funnel or engaged with a content item (e.g. article or TV series)
3. Grouping sequences of events into 'sessions'
4. Joining event data in Snowplow with other sources of data